const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const {
    getMarketingDashboard,
    getLeads,
    addLeadInteraction,
    generateSocialShareLinks,
    trackPropertyView,
    getLeadStatistics
} = require('../controllers/marketingController');

// Marketing Dashboard (Agent and Seller)
router.get('/dashboard', verifyToken, checkRole(['agent', 'seller']), getMarketingDashboard);

// Lead Management (Agent)
router.get('/leads', verifyToken, checkRole(['agent']), getLeads);
router.post('/leads/:leadId/interactions', verifyToken, checkRole(['agent']), addLeadInteraction);
router.get('/leads/statistics', verifyToken, checkRole(['agent']), getLeadStatistics);

// Social Media Integration (Agent and Seller)
router.get('/properties/:propertyId/share', verifyToken, checkRole(['agent', 'seller']), generateSocialShareLinks);

// Analytics Tracking (Public)
router.post('/properties/:propertyId/track-view', trackPropertyView);

module.exports = router; 