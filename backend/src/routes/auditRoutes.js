const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN'), getAuditLogs);

module.exports = router;