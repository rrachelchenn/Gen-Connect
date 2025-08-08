const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Get all tutors for browsing
router.get('/browse', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT 
      u.*,
      tp.age,
      tp.industry,
      tp.specialties,
      tp.hourly_rate,
      tp.total_sessions,
      tp.average_rating,
      tp.total_reviews,
      tp.tutoring_style,
      tp.availability_hours,
      tp.experience_years
    FROM users u
    LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
    WHERE u.role = 'tutor'
    ORDER BY tp.average_rating DESC, tp.total_sessions DESC
  `;
  
  db.all(query, [], (err, tutors) => {
    db.close();
    if (err) {
      console.error('Error fetching tutors:', err);
      return res.status(500).json({ error: 'Failed to fetch tutors' });
    }
    
    // Parse specialties JSON
    const formattedTutors = tutors.map(tutor => ({
      ...tutor,
      specialties: tutor.specialties ? JSON.parse(tutor.specialties) : []
    }));
    
    res.json(formattedTutors);
  });
});

// Get tutor reviews
router.get('/:tutorId/reviews', (req, res) => {
  const { tutorId } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT 
      r.*,
      u.name as reviewer_name
    FROM tutor_reviews r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.tutor_id = ?
    ORDER BY r.created_at DESC
    LIMIT 20
  `;
  
  db.all(query, [tutorId], (err, reviews) => {
    db.close();
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
    
    res.json(reviews);
  });
});

module.exports = router;
