const express = require('express');
const { createDonorProfile, getMyDonorProfile } = require('../controllers/donorController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize('DONOR'), createDonorProfile);
router.get('/me', authenticate, authorize('DONOR'), getMyDonorProfile);

module.exports = router;