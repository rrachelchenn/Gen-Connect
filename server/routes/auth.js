const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/config');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'genconnect_secret_key';

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password, name, role, techComfortLevel, college, major } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, name, and role are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `INSERT INTO users (email, password, name, role, tech_comfort_level, college, major) 
                   VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`;
    
    const result = await db.run(query, [email, hashedPassword, name, role, techComfortLevel, college, major]);
    const userId = result.lastID;

    const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
    
    const user = await db.get('SELECT id, email, name, role, tech_comfort_level, college, major FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return res.status(500).json({ error: 'Failed to retrieve user' });
    }
    
    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Verify token route
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, email, name, role, tech_comfort_level, college, major FROM users WHERE id = ?', [req.user.userId]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, authenticateToken };