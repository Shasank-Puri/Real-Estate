const pool = require('../config/db');

// Marketing Dashboard Analytics
const getMarketingDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Get property views and inquiries
        const [analytics] = await pool.query(
            `SELECT 
                p.id,
                p.title,
                p.price,
                p.property_type,
                p.status,
                COUNT(DISTINCT a.id) as total_views,
                COUNT(DISTINCT i.id) as total_inquiries,
                COUNT(DISTINCT l.id) as total_leads,
                CASE 
                    WHEN COUNT(DISTINCT a.id) > 0 
                    THEN (COUNT(DISTINCT i.id) / COUNT(DISTINCT a.id)) * 100 
                    ELSE 0 
                END as conversion_rate
            FROM properties p
            LEFT JOIN analytics a ON p.id = a.property_id
            LEFT JOIN inquiries i ON p.id = i.property_id
            LEFT JOIN leads l ON p.id = l.property_id
            WHERE p.user_id = ?
            GROUP BY p.id
            ORDER BY total_views DESC`,
            [userId]
        );

        // Get overall statistics
        const [stats] = await pool.query(
            `SELECT 
                COUNT(DISTINCT p.id) as total_properties,
                SUM(COUNT(DISTINCT a.id)) as total_views,
                SUM(COUNT(DISTINCT i.id)) as total_inquiries,
                SUM(COUNT(DISTINCT l.id)) as total_leads,
                AVG(CASE 
                    WHEN COUNT(DISTINCT a.id) > 0 
                    THEN (COUNT(DISTINCT i.id) / COUNT(DISTINCT a.id)) * 100 
                    ELSE 0 
                END) as avg_conversion_rate
            FROM properties p
            LEFT JOIN analytics a ON p.id = a.property_id
            LEFT JOIN inquiries i ON p.id = i.property_id
            LEFT JOIN leads l ON p.id = l.property_id
            WHERE p.user_id = ?
            GROUP BY p.id`,
            [userId]
        );

        res.json({
            propertyAnalytics: analytics,
            overallStats: stats[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marketing dashboard', error: error.message });
    }
};

// Lead Management
const getLeads = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const [leads] = await pool.query(
            `SELECT 
                l.*,
                p.title as property_title,
                u.name as buyer_name,
                u.email as buyer_email,
                u.phone as buyer_phone,
                COUNT(DISTINCT i.id) as interaction_count,
                MAX(i.created_at) as last_interaction
            FROM leads l
            JOIN properties p ON l.property_id = p.id
            JOIN users u ON l.buyer_id = u.id
            LEFT JOIN interactions i ON l.id = i.lead_id
            WHERE l.agent_id = ?
            GROUP BY l.id
            ORDER BY l.created_at DESC`,
            [userId]
        );

        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leads', error: error.message });
    }
};

const addLeadInteraction = async (req, res) => {
    try {
        const { leadId, type, notes } = req.body;

        const [result] = await pool.query(
            'INSERT INTO interactions (lead_id, type, notes, created_by) VALUES (?, ?, ?, ?)',
            [leadId, type, notes, req.user.id]
        );

        // Update lead status based on interaction type
        let newStatus;
        switch (type) {
            case 'contacted':
                newStatus = 'contacted';
                break;
            case 'interested':
                newStatus = 'interested';
                break;
            case 'closed':
                newStatus = 'closed';
                break;
            case 'lost':
                newStatus = 'lost';
                break;
        }

        if (newStatus) {
            await pool.query(
                'UPDATE leads SET status = ? WHERE id = ?',
                [newStatus, leadId]
            );
        }

        res.status(201).json({
            message: 'Interaction added successfully',
            interactionId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding lead interaction', error: error.message });
    }
};

// Social Media Integration
const generateSocialShareLinks = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const [property] = await pool.query(
            'SELECT * FROM properties WHERE id = ?',
            [propertyId]
        );

        if (property.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const propertyUrl = `${process.env.FRONTEND_URL}/property/${propertyId}`;
        const shareText = `Check out this ${property[0].property_type} property: ${property[0].title}`;

        const shareLinks = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(propertyUrl)}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(propertyUrl)}&title=${encodeURIComponent(property[0].title)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + propertyUrl)}`
        };

        res.json(shareLinks);
    } catch (error) {
        res.status(500).json({ message: 'Error generating share links', error: error.message });
    }
};

// Track property views
const trackPropertyView = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user?.id || null;

        await pool.query(
            'INSERT INTO analytics (property_id, user_id, type) VALUES (?, ?, ?)',
            [propertyId, userId, 'view']
        );

        res.json({ message: 'View tracked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error tracking property view', error: error.message });
    }
};

// Get lead statistics
const getLeadStatistics = async (req, res) => {
    try {
        const userId = req.user.id;

        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as total_leads,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
                SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_leads,
                SUM(CASE WHEN status = 'interested' THEN 1 ELSE 0 END) as interested_leads,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_leads,
                SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost_leads,
                AVG(CASE 
                    WHEN status = 'closed' 
                    THEN DATEDIFF(updated_at, created_at) 
                    ELSE NULL 
                END) as avg_closure_time
            FROM leads
            WHERE agent_id = ?`,
            [userId]
        );

        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lead statistics', error: error.message });
    }
};

module.exports = {
    getMarketingDashboard,
    getLeads,
    addLeadInteraction,
    generateSocialShareLinks,
    trackPropertyView,
    getLeadStatistics
}; 