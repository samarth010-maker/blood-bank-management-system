const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../utils/email');
const { logAction } = require('../utils/auditLog');

const prisma = new PrismaClient();

const ELIGIBILITY_GAP_DAYS = 90;

const scheduleDonation = async (req, res) => {
  try {
    const { userId } = req.user;
    const { scheduledDate, componentType } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ error: 'Scheduled date is required' });
    }

    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found. Please complete your profile first.' });
    }

    if (donor.lastDonationDate) {
      const daysSinceLastDonation = Math.floor(
        (new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastDonation < ELIGIBILITY_GAP_DAYS) {
        const daysRemaining = ELIGIBILITY_GAP_DAYS - daysSinceLastDonation;
        return res.status(400).json({
          error: `Not yet eligible. Please wait ${daysRemaining} more day(s) since your last donation.`,
        });
      }
    }

    const donation = await prisma.donation.create({
      data: {
        donorId: donor.id,
        scheduledDate: new Date(scheduledDate),
        componentType: componentType || null,
      },
    });

    res.status(201).json({ donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getMyDonations = async (req, res) => {
  try {
    const { userId } = req.user;

    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    const donations = await prisma.donation.findMany({
      where: { donorId: donor.id },
      orderBy: { scheduledDate: 'desc' },
    });

    res.json({ donations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getAllDonations = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
      include: {
        donor: {
          include: { user: { select: { name: true, email: true, phone: true } } },
        },
      },
    });

    res.json({ donations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, unitsCollected } = req.body;

    const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const updated = await prisma.donation.update({
      where: { id },
      data: {
        status,
        ...(unitsCollected !== undefined && { unitsCollected: parseInt(unitsCollected) }),
      },
    });

    await logAction({
      userId: req.user.userId,
      action: 'UPDATE_STATUS',
      entityType: 'Donation',
      entityId: updated.id,
      details: { status, unitsCollected },
    });

    if (status === 'COMPLETED') {
      await prisma.donor.update({
        where: { id: donation.donorId },
        data: { lastDonationDate: new Date() },
      });

      const donorWithUser = await prisma.donor.findUnique({
        where: { id: donation.donorId },
        include: { user: true },
      });

      await sendEmail({
        to: donorWithUser.user.email,
        subject: 'Thank you for your donation!',
        text: `Hi ${donorWithUser.user.name}, thank you for donating ${updated.unitsCollected} unit(s) of ${updated.componentType || 'blood'}. You'll be eligible to donate again in 90 days.`,
      });
    }

    res.json({ donation: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { scheduleDonation, getMyDonations, getAllDonations, updateDonationStatus };