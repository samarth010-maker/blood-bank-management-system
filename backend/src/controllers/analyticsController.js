const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const inventory = await prisma.bloodInventory.findMany();
    const totalUnits = inventory
      .filter((i) => new Date(i.expiryDate) > now)
      .reduce((sum, i) => sum + i.unitsAvailable, 0);

    const pendingRequests = await prisma.bloodRequest.count({ where: { status: 'PENDING' } });

    const donationsThisMonth = await prisma.donation.count({
      where: { status: 'COMPLETED', scheduledDate: { gte: startOfMonth } },
    });

    const activeDonors = await prisma.donor.count();

    const lowStockCount = inventory.filter(
      (i) => new Date(i.expiryDate) > now && i.unitsAvailable <= 5
    ).length;

    res.json({ totalUnits, pendingRequests, donationsThisMonth, activeDonors, lowStockCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getDonationTrend = async (req, res) => {
  try {
    const days = 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const donations = await prisma.donation.findMany({
      where: { status: 'COMPLETED', scheduledDate: { gte: startDate } },
    });

    const trend = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const count = donations.filter(
        (d) => new Date(d.scheduledDate).toISOString().split('T')[0] === dateStr
      ).length;

      trend.push({ date: dateStr, count });
    }

    res.json({ trend });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getBloodGroupDistribution = async (req, res) => {
  try {
    const now = new Date();
    const inventory = await prisma.bloodInventory.findMany({
      where: { expiryDate: { gt: now } },
    });

    const distribution = {};
    for (const item of inventory) {
      distribution[item.bloodGroup] = (distribution[item.bloodGroup] || 0) + item.unitsAvailable;
    }

    const result = Object.entries(distribution).map(([bloodGroup, units]) => ({ bloodGroup, units }));

    res.json({ distribution: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getWastageStats = async (req, res) => {
  try {
    const now = new Date();
    const expired = await prisma.bloodInventory.findMany({
      where: { expiryDate: { lt: now } },
    });

    const wastedUnits = expired.reduce((sum, i) => sum + i.unitsAvailable, 0);
    const wastedBatches = expired.length;

    res.json({ wastedUnits, wastedBatches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getDonorStats = async (req, res) => {
  try {
    const { userId } = req.user;

    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    const completedDonations = await prisma.donation.findMany({
      where: { donorId: donor.id, status: 'COMPLETED' },
    });

    const totalUnitsContributed = completedDonations.reduce(
      (sum, d) => sum + (d.unitsCollected || 0),
      0
    );

    const nextDonation = await prisma.donation.findFirst({
      where: { donorId: donor.id, status: 'SCHEDULED' },
      orderBy: { scheduledDate: 'asc' },
    });

    let daysUntilEligible = 0;
    if (donor.lastDonationDate) {
      const daysSince = Math.floor((new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24));
      daysUntilEligible = Math.max(0, 90 - daysSince);
    }

    res.json({
      totalDonations: completedDonations.length,
      totalUnitsContributed,
      nextDonation,
      isEligible: daysUntilEligible === 0,
      daysUntilEligible,
      bloodGroup: donor.bloodGroup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = {
  getAdminStats,
  getDonationTrend,
  getBloodGroupDistribution,
  getWastageStats,
  getDonorStats,
};