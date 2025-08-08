const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');
const JWT_SECRET = process.env.JWT_SECRET || 'genconnect_secret_key';

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password, name, role, techComfortLevel, college, major } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, name, and role are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const db = new sqlite3.Database(dbPath);

    const query = `INSERT INTO users (email, password, name, role, tech_comfort_level, college, major) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [email, hashedPassword, name, role, techComfortLevel, college, major], function(err) {
      if (err) {
        db.close();
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Failed to create user' });
      }

      const token = jwt.sign({ userId: this.lastID, role }, JWT_SECRET, { expiresIn: '24h' });
      
      db.get('SELECT id, email, name, role, tech_comfort_level, college, major FROM users WHERE id = ?', 
             [this.lastID], (err, user) => {
        db.close();
        if (err) {
          return res.status(500).json({ error: 'Failed to retrieve user' });
        }
        res.status(201).json({ token, user });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = new sqlite3.Database(dbPath);
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      db.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        db.close();
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      db.close();
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      db.close();
      res.status(500).json({ error: 'Server error' });
    }
  });
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
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Verify token route
router.get('/verify', authenticateToken, (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  db.get('SELECT id, email, name, role, tech_comfort_level, college, major FROM users WHERE id = ?', 
         [req.user.userId], (err, user) => {
    db.close();
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json({ user });
  });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;