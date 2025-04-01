const pool = require('../config/db');

// Add media to property
const addPropertyMedia = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { mediaType, mediaUrl } = req.body;

        // Verify property ownership or admin access
        const [property] = await pool.query(
            'SELECT * FROM properties WHERE id = ?',
            [propertyId]
        );

        if (property.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user owns the property or is admin
        if (property[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to add media to this property' });
        }

        const [result] = await pool.query(
            'INSERT INTO property_media (property_id, media_type, media_url) VALUES (?, ?, ?)',
            [propertyId, mediaType, mediaUrl]
        );

        res.status(201).json({
            message: 'Media added successfully',
            mediaId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding media', error: error.message });
    }
};

// Get all media for a property
const getPropertyMedia = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const [media] = await pool.query(
            'SELECT * FROM property_media WHERE property_id = ?',
            [propertyId]
        );
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property media', error: error.message });
    }
};

// Delete media from property
const deletePropertyMedia = async (req, res) => {
    try {
        const { propertyId, mediaId } = req.params;

        // Verify property ownership or admin access
        const [property] = await pool.query(
            'SELECT * FROM properties WHERE id = ?',
            [propertyId]
        );

        if (property.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user owns the property or is admin
        if (property[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete media from this property' });
        }

        await pool.query(
            'DELETE FROM property_media WHERE id = ? AND property_id = ?',
            [mediaId, propertyId]
        );

        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting media', error: error.message });
    }
};

module.exports = {
    addPropertyMedia,
    getPropertyMedia,
    deletePropertyMedia
}; 