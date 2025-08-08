const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'genconnect.db');

async function seedDemoUsers() {
  const db = new sqlite3.Database(dbPath);

  try {
    // Hash passwords
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Demo senior citizen (tutee)
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, tech_comfort_level) 
            VALUES (?, ?, ?, ?, ?)`, 
           ['demo.senior@genconnect.com', hashedPassword, 'Betty Johnson', 'tutee', 'beginner']);

    // Demo college student (tutor) - Always Alex Chen for consistency
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, college, major, bio) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, 
           ['demo.student@genconnect.com', hashedPassword, 'Alex Chen', 'tutor', 'Stanford University', 'Computer Science', 
            'Hi! I\'m Alex, a Computer Science student passionate about helping seniors navigate technology. I have experience tutoring and love making tech accessible for everyone.']);

    console.log('Demo users seeded successfully!');
  } catch (error) {
    console.error('Error seeding demo users:', error);
  } finally {
    db.close();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDemoUsers();
}

module.exports = { seedDemoUsers };