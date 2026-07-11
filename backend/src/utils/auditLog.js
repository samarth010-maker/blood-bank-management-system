const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const logAction = async ({ userId, action, entityType, entityId, details }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entityType,
        entityId: entityId || null,
        details: details || null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = { logAction };