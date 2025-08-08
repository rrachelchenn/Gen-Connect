const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Get discussion answers for a session
router.get('/session/:sessionId/answers', (req, res) => {
  const { sessionId } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT da.*, r.discussion_questions, r.title as reading_title
    FROM discussion_answers da
    JOIN readings r ON da.reading_id = r.id
    WHERE da.session_id = ?
    ORDER BY da.question_index
  `;
  
  db.all(query, [sessionId], (err, answers) => {
    db.close();
    
    if (err) {
      console.error('Error fetching discussion answers:', err);
      return res.status(500).json({ error: 'Failed to fetch discussion answers' });
    }
    
    // Parse discussion questions and format response
    const formattedAnswers = answers.map(answer => ({
      ...answer,
      discussion_questions: answer.discussion_questions ? JSON.parse(answer.discussion_questions) : []
    }));
    
    res.json(formattedAnswers);
  });
});

// Submit or update discussion answer
router.post('/session/:sessionId/answers', (req, res) => {
  const { sessionId } = req.params;
  const { readingId, questionIndex, answer, tuteeId } = req.body;
  
  if (!readingId || questionIndex === undefined || !tuteeId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const db = new sqlite3.Database(dbPath);
  
  // Check if answer already exists
  db.get(
    'SELECT id FROM discussion_answers WHERE session_id = ? AND reading_id = ? AND tutee_id = ? AND question_index = ?',
    [sessionId, readingId, tuteeId, questionIndex],
    (err, existingAnswer) => {
      if (err) {
        db.close();
        console.error('Error checking existing answer:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingAnswer) {
        // Update existing answer
        db.run(
          'UPDATE discussion_answers SET answer = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [answer, existingAnswer.id],
          function(err) {
            db.close();
            if (err) {
              console.error('Error updating answer:', err);
              return res.status(500).json({ error: 'Failed to update answer' });
            }
            res.json({ success: true, message: 'Answer updated successfully' });
          }
        );
      } else {
        // Insert new answer
        db.run(
          'INSERT INTO discussion_answers (session_id, reading_id, tutee_id, question_index, answer) VALUES (?, ?, ?, ?, ?)',
          [sessionId, readingId, tuteeId, questionIndex, answer],
          function(err) {
            db.close();
            if (err) {
              console.error('Error inserting answer:', err);
              return res.status(500).json({ error: 'Failed to save answer' });
            }
            res.json({ success: true, message: 'Answer saved successfully', id: this.lastID });
          }
        );
      }
    }
  );
});

// Get session notes
router.get('/session/:sessionId/notes', (req, res) => {
  const { sessionId } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  db.get(
    'SELECT * FROM session_notes WHERE session_id = ?',
    [sessionId],
    (err, notes) => {
      db.close();
      
      if (err) {
        console.error('Error fetching session notes:', err);
        return res.status(500).json({ error: 'Failed to fetch session notes' });
      }
      
      res.json(notes || { session_id: sessionId, tutor_notes: '', discussion_notes: '' });
    }
  );
});

// Update session notes
router.post('/session/:sessionId/notes', (req, res) => {
  const { sessionId } = req.params;
  const { tutorNotes, discussionNotes } = req.body;
  
  const db = new sqlite3.Database(dbPath);
  
  // Check if notes already exist
  db.get(
    'SELECT id FROM session_notes WHERE session_id = ?',
    [sessionId],
    (err, existingNotes) => {
      if (err) {
        db.close();
        console.error('Error checking existing notes:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingNotes) {
        // Update existing notes
        db.run(
          'UPDATE session_notes SET tutor_notes = ?, discussion_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [tutorNotes, discussionNotes, existingNotes.id],
          function(err) {
            db.close();
            if (err) {
              console.error('Error updating notes:', err);
              return res.status(500).json({ error: 'Failed to update notes' });
            }
            res.json({ success: true, message: 'Notes updated successfully' });
          }
        );
      } else {
        // Insert new notes
        db.run(
          'INSERT INTO session_notes (session_id, tutor_notes, discussion_notes) VALUES (?, ?, ?)',
          [sessionId, tutorNotes, discussionNotes],
          function(err) {
            db.close();
            if (err) {
              console.error('Error inserting notes:', err);
              return res.status(500).json({ error: 'Failed to save notes' });
            }
            res.json({ success: true, message: 'Notes saved successfully', id: this.lastID });
          }
        );
      }
    }
  );
});

module.exports = router;
