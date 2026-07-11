const express = require('express');
const {
  createRequest,
  getAllRequests,
  getMatchesForRequest,
  fulfillRequest,
  rejectRequest,
} = require('../controllers/requestController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, createRequest);
router.get('/', authenticate, authorize('STAFF', 'ADMIN'), getAllRequests);
router.get('/:id/matches', authenticate, authorize('STAFF', 'ADMIN'), getMatchesForRequest);
router.put('/:id/fulfill', authenticate, authorize('STAFF', 'ADMIN'), fulfillRequest);
router.put('/:id/reject', authenticate, authorize('STAFF', 'ADMIN'), rejectRequest);

module.exports = router;