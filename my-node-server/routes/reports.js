const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/daily', authenticateToken, authorizeRole('admin'), reportController.getDailyReport);

module.exports = router;
