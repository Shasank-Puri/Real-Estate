const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getUserNotifications,
    markNotificationAsRead
} = require('../controllers/notificationController');

// Get user notifications
router.get('/', verifyToken, getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', verifyToken, markNotificationAsRead);

module.exports = router; 