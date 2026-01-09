const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/check-in', [authenticateToken, presensiController.upload.single('image')], presensiController.CheckIn);
router.post('/check-out', authenticateToken, presensiController.CheckOut);
router.delete('/:id', authenticateToken, presensiController.deletePresensi);
router.put('/:id', authenticateToken, presensiController.updatePresensi);

module.exports = router;
