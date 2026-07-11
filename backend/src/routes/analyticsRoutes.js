const express = require('express');
const {
  getAdminStats,
  getDonationTrend,
  getBloodGroupDistribution,
  getWastageStats,
  getDonorStats,
} = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/admin-stats', authenticate, authorize('STAFF', 'ADMIN'), getAdminStats);
router.get('/donation-trend', authenticate, authorize('STAFF', 'ADMIN'), getDonationTrend);
router.get('/blood-distribution', authenticate, authorize('STAFF', 'ADMIN'), getBloodGroupDistribution);
router.get('/wastage', authenticate, authorize('STAFF', 'ADMIN'), getWastageStats);
router.get('/donor-stats', authenticate, authorize('DONOR'), getDonorStats);

module.exports = router;