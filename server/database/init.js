const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'genconnect.db');

function initDatabase() {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('tutee', 'tutor')) NOT NULL,
      tech_comfort_level TEXT CHECK(tech_comfort_level IN ('beginner', 'intermediate', 'advanced')),
      college TEXT,
      major TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Readings table
    db.run(`CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'medium', 'hard')) NOT NULL,
      topic_tags TEXT,
      discussion_questions TEXT, -- JSON array of questions
      featured_image TEXT, -- URL to featured image
      media_content TEXT, -- JSON array of media objects with type, url, caption
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tutor availability table (date-based scheduling only)
    db.run(`CREATE TABLE IF NOT EXISTS tutor_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER,
      date TEXT NOT NULL, -- Specific date (YYYY-MM-DD format)
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      topics TEXT,
      is_recurring BOOLEAN DEFAULT 0, -- Whether this is a recurring slot
      recurring_pattern TEXT, -- 'weekly', 'biweekly', 'monthly'
      recurring_end_date TEXT, -- When recurring pattern ends (YYYY-MM-DD)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tutor_id) REFERENCES users (id)
    )`);

    // Sessions table
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutee_id INTEGER,
      tutor_id INTEGER,
      reading_id INTEGER,
      session_date DATETIME,
      duration_minutes INTEGER DEFAULT 20,
      status TEXT CHECK(status IN ('pending', 'scheduled', 'active', 'completed', 'cancelled', 'declined')) DEFAULT 'pending',
      chat_room_id TEXT,
      request_expires_at DATETIME,
      zoom_meeting_id TEXT, -- Legacy column, now stores Google Meet ID
      zoom_join_url TEXT,   -- Now stores Google Meet URL
      zoom_start_url TEXT,  -- Now stores Google Meet URL
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tutee_id) REFERENCES users (id),
      FOREIGN KEY (tutor_id) REFERENCES users (id),
      FOREIGN KEY (reading_id) REFERENCES readings (id)
    )`);

    // Feedback table
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      user_id INTEGER,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comments TEXT,
      what_learned TEXT,
      follow_up_resources TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Create tutor profiles table
    db.run(`CREATE TABLE IF NOT EXISTS tutor_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      age INTEGER,
      industry TEXT,
      specialties TEXT, -- JSON array of specialties
      hourly_rate DECIMAL(6,2) DEFAULT 25.00,
      total_sessions INTEGER DEFAULT 0,
      average_rating DECIMAL(3,2) DEFAULT 0.00,
      total_reviews INTEGER DEFAULT 0,
      tutoring_style TEXT,
      availability_hours TEXT,
      experience_years INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Create tutor reviews table
    db.run(`CREATE TABLE IF NOT EXISTS tutor_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER NOT NULL,
      reviewer_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      session_topic TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tutor_id) REFERENCES users (id),
      FOREIGN KEY (reviewer_id) REFERENCES users (id)
    )`);

    // Discussion answers table - linked to tutee+reading, not session
    db.run(`CREATE TABLE IF NOT EXISTS discussion_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reading_id INTEGER NOT NULL,
      tutee_id INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      answer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reading_id) REFERENCES readings (id),
      FOREIGN KEY (tutee_id) REFERENCES users (id),
      UNIQUE(tutee_id, reading_id, question_index)
    )`);

    // Session notes table
    db.run(`CREATE TABLE IF NOT EXISTS session_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL UNIQUE,
      tutor_notes TEXT,
      discussion_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    )`);

    // Insert sample readings
    db.run(`INSERT OR IGNORE INTO readings (title, summary, content, difficulty_level, topic_tags) VALUES 
      ('Online Grocery Shopping Basics', 'Learn how to order groceries online safely and efficiently', 
       'This guide covers the fundamentals of online grocery shopping, including creating accounts, navigating websites, selecting items, and managing delivery options. We''ll walk through popular platforms like Instacart, Amazon Fresh, and local grocery store websites.', 
       'easy', 'shopping,groceries,basics'),
      
      ('Understanding Gen Z Slang', 'Decode common phrases and expressions used by younger generations', 
       'From "no cap" to "it''s giving," this reading helps bridge the communication gap between generations. Learn the meanings behind popular slang terms and when they''re typically used in conversation.', 
       'easy', 'communication,slang,social'),
      
      ('Video Calling Essentials', 'Master Zoom, FaceTime, and other video calling platforms', 
       'Step-by-step instructions for setting up and using video calling applications. Covers audio/video settings, screen sharing, and troubleshooting common issues.', 
       'medium', 'video,calling,communication'),
      
      ('Social Media Safety', 'Protect yourself while staying connected online', 
       'Learn about privacy settings, recognizing scams, and safe practices for Facebook, Instagram, and other platforms. Includes guidance on what to share and what to keep private.', 
       'medium', 'safety,social-media,privacy'),
      
      ('Smartphone Photography Tips', 'Take better photos with your phone', 
       'Discover how to use your smartphone camera features, organize photos, and share them with family. Covers basic editing and storage solutions.', 
       'easy', 'photography,smartphone,creative')`);

    console.log('Database initialized successfully');
  });

  db.close();
}

module.exports = { initDatabase };

// Run initialization if this file is called directly
if (require.main === module) {
  console.log('🚀 Initializing database...');
  initDatabase();
  console.log('✅ Database initialization complete!');
}