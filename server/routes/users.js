const express = require('express');
const { db } = require('../database/config');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all tutors
router.get('/tutors', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  db.all(`SELECT id, name, college, major, bio FROM users WHERE role = 'tutor'`, (err, tutors) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tutors' });
    }
    res.json(tutors);
  });
});

// Get tutor availability
router.get('/tutors/:id/availability', (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  db.all('SELECT * FROM tutor_availability WHERE tutor_id = ?', [id], (err, availability) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch availability' });
    }
    res.json(availability);
  });
});

// Set tutor availability (requires authentication)
router.post('/availability', authenticateToken, (req, res) => {
  const { dayOfWeek, startTime, endTime, topics } = req.body;
  const tutorId = req.user.userId;

  if (req.user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can set availability' });
  }

  const db = new sqlite3.Database(dbPath);
  
  const query = `INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, topics) 
                 VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [tutorId, dayOfWeek, startTime, endTime, topics.join(',')], function(err) {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to set availability' });
    }
    res.status(201).json({ id: this.lastID, message: 'Availability set successfully' });
  });
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const { name, techComfortLevel, college, major, bio } = req.body;
  const userId = req.user.userId;

  const db = new sqlite3.Database(dbPath);
  
  const query = `UPDATE users SET 
                 name = COALESCE(?, name),
                 tech_comfort_level = COALESCE(?, tech_comfort_level),
                 college = COALESCE(?, college),
                 major = COALESCE(?, major),
                 bio = COALESCE(?, bio)
                 WHERE id = ?`;
  
  db.run(query, [name, techComfortLevel, college, major, bio, userId], function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    // Fetch updated user data
    db.get('SELECT id, email, name, role, tech_comfort_level, college, major, bio FROM users WHERE id = ?', 
           [userId], (err, user) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch updated profile' });
      }
      res.json({ user, message: 'Profile updated successfully' });
    });
  });
});

// Get all users (admin only)
router.get('/all', authenticateToken, (req, res) => {
  // Check if user is admin (only Rachel Chen can access)
  if (req.user.name !== 'Rachel Chen') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  const db = new sqlite3.Database(dbPath);
  
  db.all('SELECT id, email, name, role, tech_comfort_level, college, major, bio, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json({ users });
  });
});

module.exports = router;