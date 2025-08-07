const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken } = require('./auth');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Submit feedback for a session
router.post('/', authenticateToken, (req, res) => {
  const { sessionId, rating, comments, whatLearned, followUpResources } = req.body;
  const userId = req.user.userId;

  if (!sessionId || !rating) {
    return res.status(400).json({ error: 'Session ID and rating are required' });
  }

  const db = new sqlite3.Database(dbPath);
  
  // First verify user is part of this session
  db.get('SELECT * FROM sessions WHERE id = ? AND (tutee_id = ? OR tutor_id = ?)', 
         [sessionId, userId, userId], (err, session) => {
    if (err || !session) {
      db.close();
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    // Check if feedback already exists
    db.get('SELECT * FROM feedback WHERE session_id = ? AND user_id = ?', 
           [sessionId, userId], (err, existingFeedback) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingFeedback) {
        // Update existing feedback
        const updateQuery = `UPDATE feedback SET 
                            rating = ?, comments = ?, what_learned = ?, follow_up_resources = ?
                            WHERE session_id = ? AND user_id = ?`;
        
        db.run(updateQuery, [rating, comments, whatLearned, followUpResources, sessionId, userId], 
               function(err) {
          db.close();
          if (err) {
            return res.status(500).json({ error: 'Failed to update feedback' });
          }
          res.json({ message: 'Feedback updated successfully' });
        });
      } else {
        // Create new feedback
        const insertQuery = `INSERT INTO feedback (session_id, user_id, rating, comments, what_learned, follow_up_resources) 
                            VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(insertQuery, [sessionId, userId, rating, comments, whatLearned, followUpResources], 
               function(err) {
          db.close();
          if (err) {
            return res.status(500).json({ error: 'Failed to submit feedback' });
          }
          res.status(201).json({ id: this.lastID, message: 'Feedback submitted successfully' });
        });
      }
    });
  });
});

// Get feedback for a session
router.get('/session/:sessionId', authenticateToken, (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.userId;

  const db = new sqlite3.Database(dbPath);
  
  // Verify user is part of this session
  db.get('SELECT * FROM sessions WHERE id = ? AND (tutee_id = ? OR tutor_id = ?)', 
         [sessionId, userId, userId], (err, session) => {
    if (err || !session) {
      db.close();
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    // Get all feedback for this session
    const feedbackQuery = `
      SELECT f.*, u.name as user_name, u.role
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      WHERE f.session_id = ?
    `;

    db.all(feedbackQuery, [sessionId], (err, feedback) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch feedback' });
      }
      res.json(feedback);
    });
  });
});

// Get user's feedback history
router.get('/my-feedback', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT f.*, s.session_date,
           tutee.name as tutee_name, tutor.name as tutor_name,
           r.title as reading_title
    FROM feedback f
    JOIN sessions s ON f.session_id = s.id
    JOIN users tutee ON s.tutee_id = tutee.id
    JOIN users tutor ON s.tutor_id = tutor.id
    JOIN readings r ON s.reading_id = r.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;

  db.all(query, [userId], (err, feedback) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch feedback history' });
    }
    res.json(feedback);
  });
});

module.exports = router;