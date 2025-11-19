const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Sample tutor data for fallback (when database is read-only)
const sampleTutorsData = [
  {
    id: 100,
    email: 'sarah.tech@stanford.edu',
    name: 'Sarah Chen',
    role: 'tutor',
    college: 'Stanford University',
    major: 'Computer Science',
    bio: 'I\'m passionate about making technology accessible to everyone. I specialize in breaking down complex tech concepts into simple, easy-to-understand steps. My approach is patient and encouraging - I believe anyone can learn technology at their own pace.',
    age: 22,
    industry: 'Technology',
    specialties: ['Smartphone Basics', 'Social Media', 'Online Shopping', 'Email & Messaging'],
    hourly_rate: 30.00,
    total_sessions: 45,
    average_rating: 4.8,
    total_reviews: 12,
    tutoring_style: 'Patient and encouraging with step-by-step guidance. I like to relate technology to everyday activities you already know.',
    availability_hours: 'Evenings and weekends',
    experience_years: 2
  },
  {
    id: 101,
    email: 'mike.business@berkeley.edu',
    name: 'Michael Rodriguez',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Business Administration',
    bio: 'As a business student, I understand the importance of staying connected in today\'s digital world. I help seniors navigate online banking, shopping, and professional communication tools with confidence and security.',
    age: 24,
    industry: 'Business',
    specialties: ['Online Banking', 'Online Shopping', 'Video Calling', 'Computer Basics'],
    hourly_rate: 28.00,
    total_sessions: 38,
    average_rating: 4.7,
    total_reviews: 10,
    tutoring_style: 'Practical and goal-oriented. I focus on real-world applications and building confidence through hands-on practice.',
    availability_hours: 'Weekday afternoons',
    experience_years: 1
  },
  {
    id: 102,
    email: 'emily.health@ucsf.edu',
    name: 'Emily Zhang',
    role: 'tutor',
    college: 'UCSF',
    major: 'Public Health',
    bio: 'My background in healthcare has taught me the importance of clear communication and patience. I help seniors use technology to stay connected with family and access important health resources online.',
    age: 23,
    industry: 'Healthcare',
    specialties: ['Video Calling', 'Email & Messaging', 'Internet Safety', 'Photo Sharing'],
    hourly_rate: 25.00,
    total_sessions: 52,
    average_rating: 4.9,
    total_reviews: 15,
    tutoring_style: 'Gentle and supportive approach. I take time to ensure you feel comfortable and confident before moving to the next step.',
    availability_hours: 'Flexible, including weekends',
    experience_years: 3
  },
  {
    id: 103,
    email: 'david.design@calarts.edu',
    name: 'David Kim',
    role: 'tutor',
    college: 'CalArts',
    major: 'Digital Media',
    bio: 'As a creative arts student, I love helping people discover the joy of digital photography and creative expression. I make technology fun and accessible for artistic and personal projects.',
    age: 21,
    industry: 'Design',
    specialties: ['Photo Sharing', 'Smartphone Basics', 'Social Media', 'Computer Basics'],
    hourly_rate: 27.00,
    total_sessions: 31,
    average_rating: 4.6,
    total_reviews: 8,
    tutoring_style: 'Creative and visual learner-focused. I use lots of examples and encourage exploration and experimentation.',
    availability_hours: 'Afternoons and early evenings',
    experience_years: 1
  },
  {
    id: 104,
    email: 'jennifer.education@ucla.edu',
    name: 'Jennifer Thompson',
    role: 'tutor',
    college: 'UCLA',
    major: 'Education',
    bio: 'As an education major, I specialize in teaching and learning strategies. I understand that everyone learns differently and adapt my teaching style to match your preferred learning method.',
    age: 25,
    industry: 'Education',
    specialties: ['Video Calling', 'Online Shopping', 'Email & Messaging', 'Internet Safety'],
    hourly_rate: 26.00,
    total_sessions: 67,
    average_rating: 4.8,
    total_reviews: 18,
    tutoring_style: 'Adaptive teaching style tailored to your learning preferences. I use repetition, visual aids, and practice exercises.',
    availability_hours: 'Mornings and weekends',
    experience_years: 2
  },
  {
    id: 105,
    email: 'robert.finance@usc.edu',
    name: 'Robert Chen',
    role: 'tutor',
    college: 'USC',
    major: 'Finance',
    bio: 'With a finance background, I understand the importance of online security and safe digital practices. I help seniors manage their digital finances and shop online securely.',
    age: 26,
    industry: 'Finance',
    specialties: ['Online Banking', 'Internet Safety', 'Online Shopping', 'Computer Basics'],
    hourly_rate: 32.00,
    total_sessions: 29,
    average_rating: 4.5,
    total_reviews: 7,
    tutoring_style: 'Security-focused with emphasis on safe practices. I ensure you understand the "why" behind each step for better retention.',
    availability_hours: 'Evening hours',
    experience_years: 1
  }
];

const sampleReviewsData = [
  { id: 1, tutor_id: 100, reviewer_name: 'Margaret Johnson', rating: 5, comment: 'Sarah was incredibly patient and helped me set up my iPhone. Now I can text my grandchildren!', session_topic: 'Smartphone Basics', date: '2025-01-15' },
  { id: 2, tutor_id: 100, reviewer_name: 'Robert Wilson', rating: 5, comment: 'Excellent teacher. Made video calling so easy to understand.', session_topic: 'Video Calling', date: '2025-01-10' },
  { id: 3, tutor_id: 101, reviewer_name: 'Dorothy Smith', rating: 5, comment: 'Mike helped me feel confident about online shopping. Very knowledgeable about security.', session_topic: 'Online Shopping', date: '2025-01-20' },
  { id: 4, tutor_id: 102, reviewer_name: 'Frank Davis', rating: 5, comment: 'Emily is wonderful! So patient and kind. I can now video call my family regularly.', session_topic: 'Video Calling', date: '2025-01-18' },
  { id: 5, tutor_id: 102, reviewer_name: 'Helen Brown', rating: 4, comment: 'Very helpful with email setup. Took her time to make sure I understood everything.', session_topic: 'Email & Messaging', date: '2025-01-12' },
  { id: 6, tutor_id: 103, reviewer_name: 'Patricia Garcia', rating: 5, comment: 'David made photo sharing fun! I can now share pictures with my whole family.', session_topic: 'Photo Sharing', date: '2025-01-22' },
  { id: 7, tutor_id: 104, reviewer_name: 'William Martinez', rating: 5, comment: 'Jennifer has a gift for teaching. Made complex topics simple and easy to follow.', session_topic: 'Internet Safety', date: '2025-01-14' }
];

// Get all tutors for browsing
router.get('/browse', async (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  // Check if tutor_profiles table exists and has data
  db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='tutor_profiles'", (err, tableExists) => {
    if (err) {
      console.log('❌ Database error, using sample data:', err.message);
      db.close();
      return res.json(sampleTutorsData);
    }
    
    if (!tableExists || tableExists.count === 0) {
      console.log('📋 Tutor profiles table missing, using sample data');
      db.close();
      return res.json(sampleTutorsData);
    }
    
    // Table exists, try to fetch data
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
        console.log('❌ Query error, using sample data:', err.message);
        return res.json(sampleTutorsData);
      }
      
      if (!tutors || tutors.length === 0) {
        console.log('📋 No tutors in database, using sample data');
        return res.json(sampleTutorsData);
      }
      
      // Parse specialties JSON
      const formattedTutors = tutors.map(tutor => ({
        ...tutor,
        specialties: tutor.specialties ? JSON.parse(tutor.specialties) : []
      }));
      
      console.log('✅ Successfully fetched tutors from database');
      res.json(formattedTutors);
    });
  });
});

// Handle contact form submissions (no auth required)
router.post('/contact', (req, res) => {
  const { tutorId, name, email, phone, message, preferredTopics } = req.body;
  
  if (!tutorId || !name || !email || !phone || !preferredTopics) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const db = new sqlite3.Database(dbPath);
  
  // Check if contact_requests table exists, create if not
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      preferred_topics TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tutor_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating contact_requests table:', err);
      db.close();
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Insert the contact request
    const insertQuery = `
      INSERT INTO contact_requests (tutor_id, name, email, phone, preferred_topics, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [tutorId, name, email, phone, preferredTopics, message || ''], function(err) {
      db.close();
      
      if (err) {
        console.error('Error inserting contact request:', err);
        return res.status(500).json({ error: 'Failed to submit contact request' });
      }
      
      console.log(`✅ Contact request submitted: ${name} -> Tutor ${tutorId}`);
      res.json({ 
        success: true, 
        message: 'Contact request submitted successfully',
        requestId: this.lastID
      });
    });
  });
});

// Get contact requests for a tutor (requires auth)
router.get('/:tutorId/contact-requests', (req, res) => {
  const { tutorId } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  // Check if contact_requests table exists
  db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='contact_requests'", (err, tableExists) => {
    if (err || !tableExists || tableExists.count === 0) {
      console.log('📋 Contact requests table does not exist yet');
      db.close();
      return res.json([]);
    }
    
    const query = `
      SELECT * FROM contact_requests
      WHERE tutor_id = ?
      ORDER BY created_at DESC
    `;
    
    db.all(query, [tutorId], (err, requests) => {
      db.close();
      
      if (err) {
        console.error('Error fetching contact requests:', err);
        return res.status(500).json({ error: 'Failed to fetch contact requests' });
      }
      
      console.log(`✅ Fetched ${requests.length} contact requests for tutor ${tutorId}`);
      res.json(requests);
    });
  });
});

// Update contact request status
router.patch('/contact-requests/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;
  
  if (!status || !['pending', 'contacted', 'scheduled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const db = new sqlite3.Database(dbPath);
  
  const query = `UPDATE contact_requests SET status = ? WHERE id = ?`;
  
  db.run(query, [status, requestId], function(err) {
    db.close();
    
    if (err) {
      console.error('Error updating contact request:', err);
      return res.status(500).json({ error: 'Failed to update request status' });
    }
    
    console.log(`✅ Updated contact request ${requestId} to ${status}`);
    res.json({ success: true, message: 'Status updated' });
  });
});

// Get tutor reviews
router.get('/:tutorId/reviews', (req, res) => {
  const { tutorId } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  // Check if reviews table exists
  db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='tutor_reviews'", (err, tableExists) => {
    if (err || !tableExists || tableExists.count === 0) {
      console.log('📋 Reviews table missing, using sample data');
      db.close();
      // Filter sample reviews for this tutor
      const tutorReviews = sampleReviewsData.filter(review => review.tutor_id == tutorId);
      return res.json(tutorReviews);
    }
    
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
        console.log('❌ Reviews query error, using sample data:', err.message);
        const tutorReviews = sampleReviewsData.filter(review => review.tutor_id == tutorId);
        return res.json(tutorReviews);
      }
      
      if (!reviews || reviews.length === 0) {
        console.log('📋 No reviews in database, using sample data');
        const tutorReviews = sampleReviewsData.filter(review => review.tutor_id == tutorId);
        return res.json(tutorReviews);
      }
      
      console.log('✅ Successfully fetched reviews from database');
      res.json(reviews);
    });
  });
});

module.exports = router;
