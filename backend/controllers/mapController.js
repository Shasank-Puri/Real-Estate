const pool = require('../config/db');

// Get properties with map data
const getPropertiesWithMapData = async (req, res) => {
    try {
        const [properties] = await pool.query(
            `SELECT p.*, u.name as owner_name 
             FROM properties p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.is_approved = true 
             AND p.latitude IS NOT NULL 
             AND p.longitude IS NOT NULL`
        );

        // Format data for Leaflet markers
        const propertiesWithMapData = properties.map(property => ({
            id: property.id,
            title: property.title,
            price: property.price,
            location: {
                lat: property.latitude,
                lng: property.longitude
            },
            propertyType: property.property_type,
            status: property.status,
            ownerName: property.owner_name,
            address: property.location,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            areaSqft: property.area_sqft
        }));

        res.json(propertiesWithMapData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties with map data', error: error.message });
    }
};

// Get route information between two points
const getRouteInfo = async (req, res) => {
    try {
        const { origin, destination, mode = 'driving' } = req.query;

        if (!origin || !destination) {
            return res.status(400).json({ message: 'Origin and destination are required' });
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (response.data.routes && response.data.routes[0]) {
            const route = response.data.routes[0];
            const leg = route.legs[0];

            res.json({
                distance: leg.distance,
                duration: leg.duration,
                startAddress: leg.start_address,
                endAddress: leg.end_address,
                steps: leg.steps,
                polyline: route.overview_polyline
            });
        } else {
            res.status(404).json({ message: 'No route found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching route information', error: error.message });
    }
};

// Get nearby properties
const getNearbyProperties = async (req, res) => {
    try {
        const { latitude, longitude, radius = 5000 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        // Calculate the bounding box for the radius
        const latDiff = radius / 111320; // 1 degree = 111.32 km
        const lonDiff = radius / (111320 * Math.cos(latitude * Math.PI / 180));

        const [properties] = await pool.query(
            `SELECT p.*, u.name as owner_name,
             (6371 * acos(cos(radians(?)) * cos(radians(p.latitude)) * 
             cos(radians(p.longitude) - radians(?)) + 
             sin(radians(?)) * sin(radians(p.latitude)))) AS distance
             FROM properties p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.is_approved = true 
             AND p.latitude BETWEEN ? - ? AND ? + ?
             AND p.longitude BETWEEN ? - ? AND ? + ?
             HAVING distance <= ?
             ORDER BY distance`,
            [
                latitude, longitude, latitude,
                latitude, latDiff, latitude, latDiff,
                longitude, lonDiff, longitude, lonDiff,
                radius / 1000 // Convert to kilometers
            ]
        );

        // Format data for Leaflet markers
        const formattedProperties = properties.map(property => ({
            id: property.id,
            title: property.title,
            price: property.price,
            location: {
                lat: property.latitude,
                lng: property.longitude
            },
            propertyType: property.property_type,
            status: property.status,
            ownerName: property.owner_name,
            address: property.location,
            distance: property.distance,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            areaSqft: property.area_sqft
        }));

        res.json(formattedProperties);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching nearby properties', error: error.message });
    }
};

// Get property clusters for different zoom levels
const getPropertyClusters = async (req, res) => {
    try {
        const [properties] = await pool.query(
            `SELECT 
                FLOOR(latitude * 100) / 100 as lat,
                FLOOR(longitude * 100) / 100 as lng,
                COUNT(*) as count,
                AVG(price) as avgPrice,
                GROUP_CONCAT(DISTINCT property_type) as propertyTypes
             FROM properties 
             WHERE is_approved = true 
             AND latitude IS NOT NULL 
             AND longitude IS NOT NULL
             GROUP BY FLOOR(latitude * 100) / 100, FLOOR(longitude * 100) / 100`
        );

        // Format data for Leaflet clusters
        const clusters = properties.map(cluster => ({
            location: {
                lat: cluster.lat,
                lng: cluster.lng
            },
            count: cluster.count,
            avgPrice: cluster.avgPrice,
            propertyTypes: cluster.propertyTypes.split(',')
        }));

        res.json(clusters);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property clusters', error: error.message });
    }
};

// Get property heatmap data
const getPropertyHeatmapData = async (req, res) => {
    try {
        const [properties] = await pool.query(
            `SELECT latitude, longitude, price, property_type
             FROM properties 
             WHERE is_approved = true 
             AND latitude IS NOT NULL 
             AND longitude IS NOT NULL`
        );

        // Process data for Leaflet heatmap
        const heatmapData = properties.map(property => ({
            lat: property.latitude,
            lng: property.longitude,
            intensity: property.price / 100000, // Normalize price for heatmap intensity
            propertyType: property.property_type
        }));

        res.json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching heatmap data', error: error.message });
    }
};

// Get property bounds (for map initialization)
const getPropertyBounds = async (req, res) => {
    try {
        const [bounds] = await pool.query(
            `SELECT 
                MIN(latitude) as minLat,
                MAX(latitude) as maxLat,
                MIN(longitude) as minLng,
                MAX(longitude) as maxLng
             FROM properties 
             WHERE is_approved = true 
             AND latitude IS NOT NULL 
             AND longitude IS NOT NULL`
        );

        if (bounds.length === 0) {
            return res.json({
                minLat: 0,
                maxLat: 0,
                minLng: 0,
                maxLng: 0
            });
        }

        res.json(bounds[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property bounds', error: error.message });
    }
};

module.exports = {
    getPropertiesWithMapData,
    getRouteInfo,
    getNearbyProperties,
    getPropertyClusters,
    getPropertyHeatmapData,
    getPropertyBounds
}; 