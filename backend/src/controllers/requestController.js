const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../utils/email');
const { logAction } = require('../utils/auditLog');

const prisma = new PrismaClient();

const compatibilityMap = {
  A_POS: ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  A_NEG: ['A_NEG', 'O_NEG'],
  B_POS: ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  B_NEG: ['B_NEG', 'O_NEG'],
  AB_POS: ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'],
  AB_NEG: ['A_NEG', 'B_NEG', 'AB_NEG', 'O_NEG'],
  O_POS: ['O_POS', 'O_NEG'],
  O_NEG: ['O_NEG'],
};

const createRequest = async (req, res) => {
  try {
    const { requesterName, hospitalName, bloodGroup, componentType, unitsNeeded, urgency } = req.body;

    if (!requesterName || !hospitalName || !bloodGroup || !componentType || !unitsNeeded || !urgency) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const request = await prisma.bloodRequest.create({
      data: {
        requesterName,
        hospitalName,
        bloodGroup,
        componentType,
        unitsNeeded: parseInt(unitsNeeded),
        urgency,
      },
    });

    if (urgency === 'EMERGENCY') {
      const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'STAFF'] } } });
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `🚨 EMERGENCY Blood Request: ${bloodGroup}`,
          text: `${hospitalName} urgently needs ${unitsNeeded} units of ${bloodGroup} (${componentType}). Requester: ${requesterName}.`,
        });
      }
    }

    res.status(201).json({ request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const urgencyOrder = { EMERGENCY: 0, URGENT: 1, NORMAL: 2 };

    const requests = await prisma.bloodRequest.findMany({ where });

    requests.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    res.json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getMatchesForRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.bloodRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const compatibleGroups = compatibilityMap[request.bloodGroup];

    const now = new Date();
    const availableStock = await prisma.bloodInventory.findMany({
      where: {
        bloodGroup: { in: compatibleGroups },
        componentType: request.componentType,
        expiryDate: { gt: now },
        unitsAvailable: { gt: 0 },
      },
      orderBy: [
        { bloodGroup: 'asc' },
        { expiryDate: 'asc' },
      ],
    });

    const exactMatches = availableStock.filter((item) => item.bloodGroup === request.bloodGroup);
    const substituteMatches = availableStock.filter((item) => item.bloodGroup !== request.bloodGroup);

    const totalAvailableUnits = availableStock.reduce((sum, item) => sum + item.unitsAvailable, 0);

    res.json({
      request,
      exactMatches,
      substituteMatches,
      totalAvailableUnits,
      canFulfill: totalAvailableUnits >= request.unitsNeeded,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.bloodRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request has already been processed' });
    }

    const compatibleGroups = compatibilityMap[request.bloodGroup];
    const now = new Date();

    const availableStock = await prisma.bloodInventory.findMany({
      where: {
        bloodGroup: { in: compatibleGroups },
        componentType: request.componentType,
        expiryDate: { gt: now },
        unitsAvailable: { gt: 0 },
      },
      orderBy: { expiryDate: 'asc' },
    });

    const totalAvailable = availableStock.reduce((sum, item) => sum + item.unitsAvailable, 0);

    if (totalAvailable < request.unitsNeeded) {
      return res.status(400).json({ error: 'Insufficient stock to fulfill this request' });
    }

    let remaining = request.unitsNeeded;
    const updates = [];

    for (const item of availableStock) {
      if (remaining <= 0) break;
      const deduct = Math.min(item.unitsAvailable, remaining);
      updates.push(
        prisma.bloodInventory.update({
          where: { id: item.id },
          data: { unitsAvailable: item.unitsAvailable - deduct },
        })
      );
      remaining -= deduct;
    }

    await prisma.$transaction(updates);

    const updatedRequest = await prisma.bloodRequest.update({
      where: { id },
      data: { status: 'FULFILLED' },
    });

    await logAction({
      userId: req.user.userId,
      action: 'FULFILL',
      entityType: 'BloodRequest',
      entityId: updatedRequest.id,
      details: { bloodGroup: request.bloodGroup, unitsNeeded: request.unitsNeeded },
    });

    res.json({ request: updatedRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.bloodRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updatedRequest = await prisma.bloodRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await logAction({
      userId: req.user.userId,
      action: 'REJECT',
      entityType: 'BloodRequest',
      entityId: updatedRequest.id,
      details: {},
    });

    res.json({ request: updatedRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createRequest, getAllRequests, getMatchesForRequest, fulfillRequest, rejectRequest };