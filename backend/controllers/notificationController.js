const pool = require('../config/db');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// Send email notification
const sendEmailNotification = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// New property listing notification
const notifyNewListing = async (propertyId) => {
    try {
        // Get property details
        const [property] = await pool.query(
            `SELECT p.*, u.name as seller_name, u.email as seller_email 
             FROM properties p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ?`,
            [propertyId]
        );

        if (property.length === 0) return;

        // Get all buyers who have set up listing alerts
        const [buyers] = await pool.query(
            `SELECT DISTINCT u.* 
             FROM users u 
             JOIN preferences p ON u.id = p.user_id 
             WHERE u.role = 'buyer' 
             AND p.notification_preferences LIKE '%listing_alert%'`
        );

        // Send notifications to buyers
        for (const buyer of buyers) {
            const subject = 'New Property Listing Alert';
            const html = `
                <h2>New Property Listing Alert</h2>
                <p>A new property has been listed that matches your preferences:</p>
                <ul>
                    <li>Title: ${property[0].title}</li>
                    <li>Price: $${property[0].price}</li>
                    <li>Type: ${property[0].property_type}</li>
                    <li>Location: ${property[0].location}</li>
                </ul>
                <p>View the property: <a href="${process.env.FRONTEND_URL}/property/${propertyId}">Click here</a></p>
            `;

            await sendEmailNotification(buyer.email, subject, html);
        }

        // Record notification in database
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [buyers.map(b => b.id), 'New Property Listing', `New property listed: ${property[0].title}`, 'listing_alert']
        );
    } catch (error) {
        console.error('Error in notifyNewListing:', error);
    }
};

// Price change notification
const notifyPriceChange = async (propertyId, oldPrice, newPrice) => {
    try {
        // Get property details
        const [property] = await pool.query(
            `SELECT p.*, u.name as seller_name, u.email as seller_email 
             FROM properties p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ?`,
            [propertyId]
        );

        if (property.length === 0) return;

        // Get users who have favorited this property
        const [interestedUsers] = await pool.query(
            `SELECT DISTINCT u.* 
             FROM users u 
             JOIN favorites f ON u.id = f.user_id 
             WHERE f.property_id = ?`,
            [propertyId]
        );

        // Send notifications
        for (const user of interestedUsers) {
            const subject = 'Property Price Change Alert';
            const html = `
                <h2>Property Price Change Alert</h2>
                <p>The price of a property you're interested in has changed:</p>
                <ul>
                    <li>Property: ${property[0].title}</li>
                    <li>Old Price: $${oldPrice}</li>
                    <li>New Price: $${newPrice}</li>
                    <li>Change: $${newPrice - oldPrice}</li>
                </ul>
                <p>View the property: <a href="${process.env.FRONTEND_URL}/property/${propertyId}">Click here</a></p>
            `;

            await sendEmailNotification(user.email, subject, html);
        }

        // Record notification in database
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [interestedUsers.map(u => u.id), 'Price Change Alert', `Price changed for ${property[0].title}`, 'price_change']
        );
    } catch (error) {
        console.error('Error in notifyPriceChange:', error);
    }
};

// Inquiry response notification
const notifyInquiryResponse = async (inquiryId) => {
    try {
        // Get inquiry details
        const [inquiry] = await pool.query(
            `SELECT i.*, p.title as property_title, 
                    u1.name as buyer_name, u1.email as buyer_email,
                    u2.name as seller_name, u2.email as seller_email
             FROM inquiries i
             JOIN properties p ON i.property_id = p.id
             JOIN users u1 ON i.buyer_id = u1.id
             JOIN users u2 ON p.user_id = u2.id
             WHERE i.id = ?`,
            [inquiryId]
        );

        if (inquiry.length === 0) return;

        // Send notification to buyer
        const subject = 'New Response to Your Property Inquiry';
        const html = `
            <h2>New Response to Your Property Inquiry</h2>
            <p>You have received a response to your inquiry about:</p>
            <ul>
                <li>Property: ${inquiry[0].property_title}</li>
                <li>Response: ${inquiry[0].response}</li>
            </ul>
            <p>View the property: <a href="${process.env.FRONTEND_URL}/property/${inquiry[0].property_id}">Click here</a></p>
        `;

        await sendEmailNotification(inquiry[0].buyer_email, subject, html);

        // Record notification in database
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [inquiry[0].buyer_id, 'Inquiry Response', `New response for ${inquiry[0].property_title}`, 'inquiry_response']
        );
    } catch (error) {
        console.error('Error in notifyInquiryResponse:', error);
    }
};

// Schedule reminder notification
const scheduleReminder = async (userId, eventType, eventDate, propertyId) => {
    try {
        // Get user and property details
        const [user] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        const [property] = await pool.query(
            'SELECT * FROM properties WHERE id = ?',
            [propertyId]
        );

        if (user.length === 0 || property.length === 0) return;

        // Calculate reminder time (24 hours before event)
        const reminderDate = new Date(eventDate);
        reminderDate.setHours(reminderDate.getHours() - 24);

        // Store reminder in database
        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, scheduled_for) VALUES (?, ?, ?, ?, ?)',
            [userId, 'Upcoming Event Reminder', `Reminder for ${eventType} at ${property[0].title}`, 'reminder', reminderDate]
        );

        // Schedule email notification
        const subject = `Reminder: ${eventType} Tomorrow`;
        const html = `
            <h2>Upcoming Event Reminder</h2>
            <p>This is a reminder that you have an upcoming event tomorrow:</p>
            <ul>
                <li>Event: ${eventType}</li>
                <li>Property: ${property[0].title}</li>
                <li>Date: ${eventDate}</li>
                <li>Location: ${property[0].location}</li>
            </ul>
            <p>View the property: <a href="${process.env.FRONTEND_URL}/property/${propertyId}">Click here</a></p>
        `;

        // Schedule the email to be sent
        setTimeout(async () => {
            await sendEmailNotification(user[0].email, subject, html);
        }, reminderDate.getTime() - Date.now());
    } catch (error) {
        console.error('Error in scheduleReminder:', error);
    }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const [notifications] = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
};

module.exports = {
    notifyNewListing,
    notifyPriceChange,
    notifyInquiryResponse,
    scheduleReminder,
    getUserNotifications,
    markNotificationAsRead
}; 