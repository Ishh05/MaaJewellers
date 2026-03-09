// ============================================================
//  MAA JEWELLERS — Auth Routes
//  POST /api/auth/login  → returns JWT token
// ============================================================

const express = require('express');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const router  = express.Router();

// ── POST /api/auth/login ────────────────────────────────────
// Body: { username, password }
// Returns: { success, token, message }
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    // Compare against .env credentials (plain text comparison for simplicity)
    // For production, store a bcrypt hash in .env instead
    const validUsername = username.trim() === process.env.ADMIN_USERNAME;
    const validPassword = password        === process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Access denied.',
      });
    }

    // Sign JWT — expires in 8 hours
    const token = jwt.sign(
      { role: 'admin', username: process.env.ADMIN_USERNAME },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      message: 'Login successful. Welcome, Owner! ✨',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ── POST /api/auth/verify ──────────────────────────────────
// Lightweight token validity check (used on admin page load)
router.post('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ valid: false });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.json({ valid: false });
  }
});

module.exports = router;
