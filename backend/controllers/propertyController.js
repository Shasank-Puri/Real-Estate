const pool = require('../config/db');

// Create property listing (Agent and Seller)
const createProperty = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            property_type,
            status,
            location,
            latitude,
            longitude,
            bedrooms,
            bathrooms,
            area_sqft
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO properties (
                user_id, title, description, price, property_type, 
                status, location, latitude, longitude, bedrooms, 
                bathrooms, area_sqft, is_approved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id, title, description, price, property_type,
                status, location, latitude, longitude, bedrooms,
                bathrooms, area_sqft, req.user.role === 'admin' ? true : false
            ]
        );

        res.status(201).json({
            message: 'Property created successfully',
            propertyId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating property', error: error.message });
    }
};

// Get all properties (public)
const getAllProperties = async (req, res) => {
    try {
        const [properties] = await pool.query(
            `SELECT p.*, u.name as owner_name 
             FROM properties p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.is_approved = true`
        );
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties', error: error.message });
    }
};

// Get property by ID (public)
const getPropertyById = async (req, res) => {
    try {
        const [properties] = await pool.query(
            `SELECT p.*, u.name as owner_name 
             FROM properties p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ? AND p.is_approved = true`,
            [req.params.id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json(properties[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property', error: error.message });
    }
};

// Update property (Agent and Seller - only their own listings)
const updateProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const [property] = await pool.query(
            'SELECT * FROM properties WHERE id = ?',
            [propertyId]
        );

        if (property.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user owns the property or is admin
        if (property[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }

        const {
            title,
            description,
            price,
            property_type,
            status,
            location,
            latitude,
            longitude,
            bedrooms,
            bathrooms,
            area_sqft
        } = req.body;

        await pool.query(
            `UPDATE properties SET 
                title = ?, description = ?, price = ?, property_type = ?,
                status = ?, location = ?, latitude = ?, longitude = ?,
                bedrooms = ?, bathrooms = ?, area_sqft = ?
            WHERE id = ?`,
            [
                title, description, price, property_type,
                status, location, latitude, longitude,
                bedrooms, bathrooms, area_sqft, propertyId
            ]
        );

        res.json({ message: 'Property updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating property', error: error.message });
    }
};

// Delete property (Agent and Seller - only their own listings)
const deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const [property] = await pool.query(
            'SELECT * FROM properties WHERE id = ?',
            [propertyId]
        );

        if (property.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if user owns the property or is admin
        if (property[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this property' });
        }

        await pool.query('DELETE FROM properties WHERE id = ?', [propertyId]);
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting property', error: error.message });
    }
};

// Approve property (Admin only)
const approveProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        await pool.query(
            'UPDATE properties SET is_approved = true WHERE id = ?',
            [propertyId]
        );
        res.json({ message: 'Property approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving property', error: error.message });
    }
};

// Get pending properties (Admin only)
const getPendingProperties = async (req, res) => {
    try {
        const [properties] = await pool.query(
            `SELECT p.*, u.name as owner_name 
             FROM properties p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.is_approved = false`
        );
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending properties', error: error.message });
    }
};

// Get properties by category and status
const getPropertiesByCategory = async (req, res) => {
    try {
        const { propertyType, status } = req.query;
        let query = `
            SELECT p.*, u.name as owner_name 
            FROM properties p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.is_approved = true
        `;
        const params = [];

        if (propertyType) {
            query += ' AND p.property_type = ?';
            params.push(propertyType);
        }

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        const [properties] = await pool.query(query, params);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties', error: error.message });
    }
};

// Search properties
const searchProperties = async (req, res) => {
    try {
        const {
            propertyType,
            status,
            minPrice,
            maxPrice,
            location,
            bedrooms,
            bathrooms,
            minArea,
            maxArea
        } = req.query;

        let query = `
            SELECT p.*, u.name as owner_name 
            FROM properties p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.is_approved = true
        `;
        const params = [];

        if (propertyType) {
            query += ' AND p.property_type = ?';
            params.push(propertyType);
        }

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        if (minPrice) {
            query += ' AND p.price >= ?';
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND p.price <= ?';
            params.push(maxPrice);
        }

        if (location) {
            query += ' AND p.location LIKE ?';
            params.push(`%${location}%`);
        }

        if (bedrooms) {
            query += ' AND p.bedrooms = ?';
            params.push(bedrooms);
        }

        if (bathrooms) {
            query += ' AND p.bathrooms = ?';
            params.push(bathrooms);
        }

        if (minArea) {
            query += ' AND p.area_sqft >= ?';
            params.push(minArea);
        }

        if (maxArea) {
            query += ' AND p.area_sqft <= ?';
            params.push(maxArea);
        }

        const [properties] = await pool.query(query, params);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error searching properties', error: error.message });
    }
};

// Get property statistics
const getPropertyStats = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_properties,
                SUM(CASE WHEN property_type = 'residential' THEN 1 ELSE 0 END) as residential_count,
                SUM(CASE WHEN property_type = 'commercial' THEN 1 ELSE 0 END) as commercial_count,
                SUM(CASE WHEN property_type = 'rental' THEN 1 ELSE 0 END) as rental_count,
                SUM(CASE WHEN status = 'for sale' THEN 1 ELSE 0 END) as for_sale_count,
                SUM(CASE WHEN status = 'for rent' THEN 1 ELSE 0 END) as for_rent_count,
                AVG(price) as average_price
            FROM properties
            WHERE is_approved = true
        `);
        res.json(stats[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property statistics', error: error.message });
    }
};

module.exports = {
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
}; 