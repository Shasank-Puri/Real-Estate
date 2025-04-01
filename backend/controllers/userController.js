const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../config/db');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Generate verification token
const generateVerificationToken = () => {
  return jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, false]
    );

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Verify your email address',
      html: `
                <h1>Welcome to REMIS!</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}">Verify Email</a>
            `
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      userId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update user verification status
    await pool.query(
      'UPDATE users SET is_verified = true WHERE email = ?',
      [decoded.email]
    );

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired verification token' });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists and is not verified
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_verified = false',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found or already verified' });
    }

    const verificationToken = generateVerificationToken();
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Verify your email address',
      html: `
                <h1>Welcome to REMIS!</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}">Verify Email</a>
            `
    });

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification email', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Admin specific functions
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, is_verified, created_at FROM users'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_verified } = req.body;

    await pool.query(
      'UPDATE users SET is_verified = ? WHERE id = ?',
      [is_verified, userId]
    );

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// Agent specific functions
const getAgentLeads = async (req, res) => {
  try {
    const [leads] = await pool.query(
      `SELECT l.*, p.title as property_title, u.name as buyer_name 
             FROM leads l 
             JOIN properties p ON l.property_id = p.id 
             JOIN users u ON l.buyer_id = u.id 
             WHERE l.agent_id = ?`,
      [req.user.id]
    );
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads', error: error.message });
  }
};

// Buyer specific functions
const getFavorites = async (req, res) => {
  try {
    const [favorites] = await pool.query(
      `SELECT f.*, p.* 
             FROM favorites f 
             JOIN properties p ON f.property_id = p.id 
             WHERE f.user_id = ?`,
      [req.user.id]
    );
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  updateUserStatus,
  getAgentLeads,
  getFavorites,
  verifyEmail,
  resendVerificationEmail
};
