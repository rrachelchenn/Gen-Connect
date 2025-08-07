const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Get all readings
router.get('/', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  db.all('SELECT * FROM readings ORDER BY created_at DESC', (err, readings) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch readings' });
    }
    res.json(readings);
  });
});

// Get reading by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  db.get('SELECT * FROM readings WHERE id = ?', [id], (err, reading) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch reading' });
    }
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    res.json(reading);
  });
});

// Search readings by topic tags or difficulty
router.get('/search/:query', (req, res) => {
  const { query } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  const searchQuery = `SELECT * FROM readings 
                       WHERE title LIKE ? OR topic_tags LIKE ? OR difficulty_level = ?
                       ORDER BY created_at DESC`;
  
  const searchTerm = `%${query}%`;
  
  db.all(searchQuery, [searchTerm, searchTerm, query], (err, readings) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to search readings' });
    }
    res.json(readings);
  });
});

module.exports = router;