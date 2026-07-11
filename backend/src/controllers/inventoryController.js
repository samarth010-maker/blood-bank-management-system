const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../utils/email');
const { logAction } = require('../utils/auditLog');

const prisma = new PrismaClient();

const EXPIRY_WARNING_DAYS = 7;
const LOW_STOCK_THRESHOLD = 5;

const getExpiryStatus = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return 'EXPIRED';
  if (daysLeft <= EXPIRY_WARNING_DAYS) return 'NEAR_EXPIRY';
  return 'HEALTHY';
};

const createInventory = async (req, res) => {
  try {
    const { bloodGroup, componentType, unitsAvailable, expiryDate, storageLocation } = req.body;

    if (!bloodGroup || !componentType || !unitsAvailable || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const inventory = await prisma.bloodInventory.create({
      data: {
        bloodGroup,
        componentType,
        unitsAvailable: parseInt(unitsAvailable),
        expiryDate: new Date(expiryDate),
        storageLocation,
      },
    });

    await logAction({
      userId: req.user.userId,
      action: 'CREATE',
      entityType: 'BloodInventory',
      entityId: inventory.id,
      details: { bloodGroup, componentType, unitsAvailable: inventory.unitsAvailable },
    });

    res.status(201).json({ inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getAllInventory = async (req, res) => {
  try {
    const { bloodGroup, componentType } = req.query;

    const where = {};
    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (componentType) where.componentType = componentType;

    const inventory = await prisma.bloodInventory.findMany({
      where,
      orderBy: { expiryDate: 'asc' },
    });

    const withStatus = inventory.map((item) => ({
      ...item,
      expiryStatus: getExpiryStatus(item.expiryDate),
    }));

    res.json({ inventory: withStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { unitsAvailable, expiryDate, storageLocation } = req.body;

    const existing = await prisma.bloodInventory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const inventory = await prisma.bloodInventory.update({
      where: { id },
      data: {
        ...(unitsAvailable !== undefined && { unitsAvailable: parseInt(unitsAvailable) }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(storageLocation !== undefined && { storageLocation }),
      },
    });

    await logAction({
      userId: req.user.userId,
      action: 'UPDATE',
      entityType: 'BloodInventory',
      entityId: inventory.id,
      details: req.body,
    });

    if (inventory.unitsAvailable <= LOW_STOCK_THRESHOLD) {
      const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'STAFF'] } } });
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `⚠️ Low Stock Alert: ${inventory.bloodGroup}`,
          text: `${inventory.bloodGroup} (${inventory.componentType}) is running low: only ${inventory.unitsAvailable} units left at ${inventory.storageLocation}.`,
        });
      }
    }

    res.json({ inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.bloodInventory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await prisma.bloodInventory.delete({ where: { id } });

    await logAction({
      userId: req.user.userId,
      action: 'DELETE',
      entityType: 'BloodInventory',
      entityId: id,
      details: { bloodGroup: existing.bloodGroup, componentType: existing.componentType },
    });

    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createInventory, getAllInventory, updateInventory, deleteInventory };