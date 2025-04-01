const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getPropertiesWithMapData,
    getNearbyProperties,
    getPropertyClusters,
    getPropertyHeatmapData,
    getPropertyBounds
} = require('../controllers/mapController');

// Public routes
router.get('/properties', getPropertiesWithMapData);
router.get('/nearby', getNearbyProperties);
router.get('/clusters', getPropertyClusters);
router.get('/heatmap', getPropertyHeatmapData);
router.get('/bounds', getPropertyBounds);

module.exports = router; 