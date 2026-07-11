const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createDonorProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { bloodGroup, dateOfBirth, address, latitude, longitude } = req.body;

    if (!bloodGroup || !dateOfBirth) {
      return res.status(400).json({ error: 'Blood group and date of birth are required' });
    }

    const existingProfile = await prisma.donor.findUnique({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ error: 'Donor profile already exists' });
    }

    const donor = await prisma.donor.create({
      data: {
        userId,
        bloodGroup,
        dateOfBirth: new Date(dateOfBirth),
        address,
        latitude,
        longitude,
      },
    });

    res.status(201).json({ donor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getMyDonorProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const donor = await prisma.donor.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    res.json({ donor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { createDonorProfile, getMyDonorProfile };