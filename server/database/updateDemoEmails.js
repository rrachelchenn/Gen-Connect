const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'genconnect.db');

function updateDemoEmails() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('🔄 Updating demo user email addresses...');

    // Update Alex Chen's email (tutor)
    db.run(`UPDATE users SET email = ? WHERE name = ? AND role = ?`, 
           ['rachel_chen@berkeley.edu', 'Alex Chen', 'tutor'], 
           function(err) {
             if (err) {
               console.error('Error updating Alex Chen email:', err);
             } else {
               console.log(`✅ Updated Alex Chen email (${this.changes} rows affected)`);
             }
           });

    // Update Betty Johnson's email (tutee)
    db.run(`UPDATE users SET email = ? WHERE name = ? AND role = ?`, 
           ['rachelchen0211@gmail.com', 'Betty Johnson', 'tutee'], 
           function(err) {
             if (err) {
               console.error('Error updating Betty Johnson email:', err);
             } else {
               console.log(`✅ Updated Betty Johnson email (${this.changes} rows affected)`);
             }
           });

    console.log('📧 Demo email addresses updated for calendar invite testing!');
    console.log('   - Alex Chen (tutor): rachel_chen@berkeley.edu');
    console.log('   - Betty Johnson (tutee): rachelchen0211@gmail.com');
    
  } catch (error) {
    console.error('Error updating demo emails:', error);
  } finally {
    // Close database after a short delay to let queries complete
    setTimeout(() => {
      db.close();
      console.log('✅ Database connection closed');
    }, 1000);
  }
}

// Run update if this file is executed directly
if (require.main === module) {
  updateDemoEmails();
}

module.exports = { updateDemoEmails };
