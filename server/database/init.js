const { db, isProduction } = require('./config');

function initDatabase() {
  if (isProduction) {
    // PostgreSQL initialization
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) CHECK (role IN ('tutee', 'tutor')) NOT NULL,
        tech_comfort_level VARCHAR(50) CHECK (tech_comfort_level IN ('beginner', 'intermediate', 'advanced')),
        college VARCHAR(255),
        major VARCHAR(255),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createReadingsTable = `
      CREATE TABLE IF NOT EXISTS readings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('easy', 'medium', 'hard')) NOT NULL,
        topic_tags TEXT,
        discussion_questions TEXT,
        featured_image VARCHAR(500),
        media_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createTutorAvailabilityTable = `
      CREATE TABLE IF NOT EXISTS tutor_availability (
        id SERIAL PRIMARY KEY,
        tutor_id INTEGER REFERENCES users(id),
        date VARCHAR(10) NOT NULL,
        start_time VARCHAR(5) NOT NULL,
        end_time VARCHAR(5) NOT NULL,
        topics TEXT,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurring_pattern VARCHAR(20),
        recurring_end_date VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Execute PostgreSQL queries
    db.run(createUsersTable);
    db.run(createReadingsTable);
    db.run(createTutorAvailabilityTable);
    
    console.log('PostgreSQL database initialized successfully');
  } else {
    // SQLite initialization (existing code)
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
        discussion_questions TEXT,
        featured_image TEXT,
        media_content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Tutor availability table
      db.run(`CREATE TABLE IF NOT EXISTS tutor_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tutor_id INTEGER,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        topics TEXT,
        is_recurring BOOLEAN DEFAULT 0,
        recurring_pattern TEXT,
        recurring_end_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tutor_id) REFERENCES users (id)
      )`);
    });
    
    console.log('SQLite database initialized successfully');
  }
}

module.exports = { initDatabase };

// Run initialization if this file is called directly
if (require.main === module) {
  console.log('🚀 Initializing database...');
  initDatabase();
  console.log('✅ Database initialization complete!');
}