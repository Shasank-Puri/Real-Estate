const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const {
    addPropertyMedia,
    getPropertyMedia,
    deletePropertyMedia
} = require('../controllers/propertyMediaController');

// Get media for a property (public)
router.get('/:propertyId', getPropertyMedia);

// Protected routes (agent and seller only)
router.post('/:propertyId', verifyToken, checkRole(['agent', 'seller']), addPropertyMedia);
router.delete('/:propertyId/:mediaId', verifyToken, checkRole(['agent', 'seller', 'admin']), deletePropertyMedia);

module.exports = router; 