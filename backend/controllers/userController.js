const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your mail service
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const [existing] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const verificationLink = `http://localhost:5000/api/users/verify/${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Verify your REMIS account",
      html: `<p>Hello ${name}, please verify your email by clicking below:</p>
             <a href="${verificationLink}">Verify Email</a>`,
    });

    await db.execute("INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)", [name, email, hashedPassword, role, false]);

    res.status(201).json({ msg: "Registration successful. Check your email to verify." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    await db.execute("UPDATE users SET is_verified = 1 WHERE email = ?", [email]);

    res.send("<h2>Email verified! You can now log in.</h2>");
  } catch (err) {
    res.status(400).send("<h2>Invalid or expired token</h2>");
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ msg: "Incorrect password" });

    if (!user.is_verified) return res.status(403).json({ msg: "Email not verified" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
