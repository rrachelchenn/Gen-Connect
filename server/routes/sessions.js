const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('./auth');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Book a session (tutee only)
router.post('/book', authenticateToken, (req, res) => {
  const { tutorId, readingId, sessionDate } = req.body;
  const tuteeId = req.user.userId;

  if (req.user.role !== 'tutee') {
    return res.status(403).json({ error: 'Only tutees can book sessions' });
  }

  const chatRoomId = uuidv4();
  const db = new sqlite3.Database(dbPath);
  
  const query = `INSERT INTO sessions (tutee_id, tutor_id, reading_id, session_date, chat_room_id) 
                 VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [tuteeId, tutorId, readingId, sessionDate, chatRoomId], function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to book session' });
    }

    // Fetch session details with user and reading info
    const sessionQuery = `
      SELECT s.*, 
             tutee.name as tutee_name, tutee.email as tutee_email,
             tutor.name as tutor_name, tutor.email as tutor_email,
             r.title as reading_title, r.summary as reading_summary
      FROM sessions s
      JOIN users tutee ON s.tutee_id = tutee.id
      JOIN users tutor ON s.tutor_id = tutor.id
      JOIN readings r ON s.reading_id = r.id
      WHERE s.id = ?
    `;

    db.get(sessionQuery, [this.lastID], (err, session) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to retrieve session details' });
      }
      res.status(201).json({ session, message: 'Session booked successfully' });
    });
  });
});

// Get user's sessions
router.get('/my-sessions', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  
  const db = new sqlite3.Database(dbPath);
  
  let query;
  if (role === 'tutee') {
    query = `
      SELECT s.*, 
             tutor.name as tutor_name, tutor.college as tutor_college,
             r.title as reading_title, r.summary as reading_summary
      FROM sessions s
      JOIN users tutor ON s.tutor_id = tutor.id
      JOIN readings r ON s.reading_id = r.id
      WHERE s.tutee_id = ?
      ORDER BY s.session_date DESC
    `;
  } else {
    query = `
      SELECT s.*, 
             tutee.name as tutee_name, tutee.tech_comfort_level,
             r.title as reading_title, r.summary as reading_summary
      FROM sessions s
      JOIN users tutee ON s.tutee_id = tutee.id
      JOIN readings r ON s.reading_id = r.id
      WHERE s.tutor_id = ?
      ORDER BY s.session_date DESC
    `;
  }
  
  db.all(query, [userId], (err, sessions) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
    res.json(sessions);
  });
});

// Get session details for live session
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT s.*, 
           tutee.name as tutee_name, tutee.email as tutee_email,
           tutor.name as tutor_name, tutor.email as tutor_email,
           r.title as reading_title, r.content as reading_content, r.summary as reading_summary
    FROM sessions s
    JOIN users tutee ON s.tutee_id = tutee.id
    JOIN users tutor ON s.tutor_id = tutor.id
    JOIN readings r ON s.reading_id = r.id
    WHERE s.id = ? AND (s.tutee_id = ? OR s.tutor_id = ?)
  `;
  
  db.get(query, [id, userId, userId], (err, session) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch session' });
    }
    if (!session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    res.json(session);
  });
});

// Update session status
router.put('/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;
  
  const db = new sqlite3.Database(dbPath);
  
  // First check if user is part of this session
  db.get('SELECT * FROM sessions WHERE id = ? AND (tutee_id = ? OR tutor_id = ?)', 
         [id, userId, userId], (err, session) => {
    if (err || !session) {
      db.close();
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    db.run('UPDATE sessions SET status = ? WHERE id = ?', [status, id], function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to update session status' });
      }
      res.json({ message: 'Session status updated successfully' });
    });
  });
});

module.exports = router;