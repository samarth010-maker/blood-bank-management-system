const express = require('express');
const {
  createInventory,
  getAllInventory,
  updateInventory,
  deleteInventory,
} = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize('STAFF', 'ADMIN'), createInventory);
router.get('/', authenticate, getAllInventory);
router.put('/:id', authenticate, authorize('STAFF', 'ADMIN'), updateInventory);
router.delete('/:id', authenticate, authorize('STAFF', 'ADMIN'), deleteInventory);

module.exports = router;