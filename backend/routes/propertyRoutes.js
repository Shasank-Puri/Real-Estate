const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    approveProperty,
    getPendingProperties,
    getPropertiesByCategory,
    searchProperties,
    getPropertyStats
} = require('../controllers/propertyController');

// Public routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.get('/category', getPropertiesByCategory);
router.get('/search', searchProperties);
router.get('/stats', getPropertyStats);

// Protected routes
router.post('/', verifyToken, checkRole(['agent', 'seller']), createProperty);
router.put('/:id', verifyToken, checkRole(['agent', 'seller', 'admin']), updateProperty);
router.delete('/:id', verifyToken, checkRole(['agent', 'seller', 'admin']), deleteProperty);

// Admin only routes
router.get('/pending', verifyToken, checkRole(['admin']), getPendingProperties);
router.patch('/:id/approve', verifyToken, checkRole(['admin']), approveProperty);

module.exports = router; 