const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const {
    register,
    login,
    getAllUsers,
    updateUserStatus,
    getAgentLeads,
    getFavorites,
    verifyEmail,
    resendVerificationEmail
} = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Admin routes
router.get('/users', verifyToken, checkRole(['admin']), getAllUsers);
router.patch('/users/:userId/status', verifyToken, checkRole(['admin']), updateUserStatus);

// Agent routes
router.get('/leads', verifyToken, checkRole(['agent']), getAgentLeads);

// Buyer routes
router.get('/favorites', verifyToken, checkRole(['buyer']), getFavorites);

module.exports = router;
