const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStats, getAllUsers, toggleUserStatus } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/toggle', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
