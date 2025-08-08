const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { seedSampleTutors } = require('../database/seedTutors');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Get all tutors for browsing
router.get('/browse', async (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  // Check if tutor_profiles table exists, if not seed the data
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='tutor_profiles'", async (err, row) => {
    if (err) {
      console.error('Error checking table:', err);
      db.close();
      return res.status(500).json({ error: 'Failed to fetch tutors' });
    }
    
    // If table doesn't exist, seed the sample tutors
    if (!row) {
      console.log('🔧 Tutor profiles table missing, seeding sample tutors...');
      db.close();
      try {
        await seedSampleTutors();
        console.log('✅ Seeding completed, retrying query...');
        // Retry the query after seeding
        return fetchTutors(res);
      } catch (seedErr) {
        console.error('❌ Error seeding tutors:', seedErr);
        return res.status(500).json({ error: 'Failed to initialize tutors', details: seedErr.message });
      }
    } else {
      console.log('📊 Tutor profiles table exists, fetching data...');
      // Table exists, proceed with query
      fetchTutorsFromDB(db, res);
    }
  });
});

function fetchTutors(res) {
  const db = new sqlite3.Database(dbPath);
  fetchTutorsFromDB(db, res);
}

function fetchTutorsFromDB(db, res) {
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
}

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
