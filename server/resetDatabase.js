const fs = require('fs');
const path = require('path');
const { initDatabase } = require('./database/init');
const { seedDemoUsers } = require('./database/seed');
const { seedSampleTutors } = require('./database/seedTutors');

async function resetDatabase() {
  console.log('🗑️  Resetting database...');
  
  const dbPath = path.join(__dirname, 'database/genconnect.db');
  
  // Delete existing database if it exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Deleted existing database');
  }
  
  // Reinitialize database with new schema
  console.log('🔧 Initializing database with new schema...');
  await initDatabase();
  
  // Wait a moment for database to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Seed demo users
  console.log('👥 Seeding demo users...');
  await seedDemoUsers();
  
  // Seed sample tutors
  console.log('🎓 Seeding sample tutors and reviews...');
  await seedSampleTutors();
  
  console.log('🎉 Database reset complete!');
  process.exit(0);
}

resetDatabase().catch(error => {
  console.error('❌ Error resetting database:', error);
  process.exit(1);
});
