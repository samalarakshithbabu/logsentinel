const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const config = require('../config');
const { body, validationResult } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimiter');

// Register new user
router.post('/register', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password, name, role = 'developer' } = req.body;
    
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, role]
    );
    
    const token = jwt.sign(
      { id: result.insertId, email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, email, name, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, name, role, is_active, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Refresh token
router.post('/refresh', require('../middleware/auth').auth, (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, email: req.user.email, role: req.user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  
  res.json({ token });
});

module.exports = router;