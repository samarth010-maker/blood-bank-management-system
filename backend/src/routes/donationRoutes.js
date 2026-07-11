const express = require('express');
const {
  scheduleDonation,
  getMyDonations,
  getAllDonations,
  updateDonationStatus,
} = require('../controllers/donationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize('DONOR'), scheduleDonation);
router.get('/me', authenticate, authorize('DONOR'), getMyDonations);
router.get('/', authenticate, authorize('STAFF', 'ADMIN'), getAllDonations);
router.put('/:id', authenticate, authorize('STAFF', 'ADMIN'), updateDonationStatus);

module.exports = router;