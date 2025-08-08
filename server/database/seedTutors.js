const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'genconnect.db');

async function seedSampleTutors() {
  const db = new sqlite3.Database(dbPath);

  try {
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Sample tutors with different backgrounds
    const sampleTutors = [
      {
        email: 'sarah.tech@stanford.edu',
        name: 'Sarah Chen',
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
        email: 'mike.business@berkeley.edu',
        name: 'Michael Rodriguez',
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
        email: 'emily.health@ucsf.edu',
        name: 'Emily Zhang',
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
        email: 'david.design@calarts.edu',
        name: 'David Kim',
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
        email: 'jennifer.education@ucla.edu',
        name: 'Jennifer Thompson',
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
        email: 'robert.finance@usc.edu',
        name: 'Robert Chen',
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

    // Insert sample tutors
    for (const tutor of sampleTutors) {
      // First insert the user
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT OR IGNORE INTO users (email, password, name, role, college, major, bio) 
           VALUES (?, ?, ?, 'tutor', ?, ?, ?)`,
          [tutor.email, hashedPassword, tutor.name, tutor.college, tutor.major, tutor.bio],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      // Get the user ID
      const userId = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ?', [tutor.email], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.id : null);
        });
      });

      if (userId) {
        // Insert tutor profile
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT OR REPLACE INTO tutor_profiles 
             (user_id, age, industry, specialties, hourly_rate, total_sessions, 
              average_rating, total_reviews, tutoring_style, availability_hours, experience_years)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId, tutor.age, tutor.industry, JSON.stringify(tutor.specialties),
              tutor.hourly_rate, tutor.total_sessions, tutor.average_rating,
              tutor.total_reviews, tutor.tutoring_style, tutor.availability_hours,
              tutor.experience_years
            ],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
      }
    }

    // Insert sample reviews
    const sampleReviews = [
      { tutor_email: 'sarah.tech@stanford.edu', reviewer_name: 'Margaret Johnson', rating: 5, comment: 'Sarah was incredibly patient and helped me set up my iPhone. Now I can text my grandchildren!', session_topic: 'Smartphone Basics' },
      { tutor_email: 'sarah.tech@stanford.edu', reviewer_name: 'Robert Wilson', rating: 5, comment: 'Excellent teacher. Made video calling so easy to understand.', session_topic: 'Video Calling' },
      { tutor_email: 'mike.business@berkeley.edu', reviewer_name: 'Dorothy Smith', rating: 5, comment: 'Mike helped me feel confident about online shopping. Very knowledgeable about security.', session_topic: 'Online Shopping' },
      { tutor_email: 'emily.health@ucsf.edu', reviewer_name: 'Frank Davis', rating: 5, comment: 'Emily is wonderful! So patient and kind. I can now video call my family regularly.', session_topic: 'Video Calling' },
      { tutor_email: 'emily.health@ucsf.edu', reviewer_name: 'Helen Brown', rating: 4, comment: 'Very helpful with email setup. Took her time to make sure I understood everything.', session_topic: 'Email & Messaging' },
      { tutor_email: 'david.design@calarts.edu', reviewer_name: 'Patricia Garcia', rating: 5, comment: 'David made photo sharing fun! I can now share pictures with my whole family.', session_topic: 'Photo Sharing' },
      { tutor_email: 'jennifer.education@ucla.edu', reviewer_name: 'William Martinez', rating: 5, comment: 'Jennifer has a gift for teaching. Made complex topics simple and easy to follow.', session_topic: 'Internet Safety' }
    ];

    // Insert reviews
    for (const review of sampleReviews) {
      // Get tutor ID
      const tutorId = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ?', [review.tutor_email], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.id : null);
        });
      });

      // Get or create reviewer (use demo tutee)
      const reviewerId = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ?', ['demo.senior@genconnect.com'], (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.id : 1); // Default to user ID 1 if demo user not found
        });
      });

      if (tutorId && reviewerId) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT OR IGNORE INTO tutor_reviews (tutor_id, reviewer_id, rating, comment, session_topic, date)
             VALUES (?, ?, ?, ?, ?, datetime('now', '-' || abs(random() % 30) || ' days'))`,
            [tutorId, reviewerId, review.rating, review.comment, review.session_topic],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
      }
    }

    console.log('Sample tutors and reviews seeded successfully!');
  } catch (error) {
    console.error('Error seeding tutors:', error);
  } finally {
    db.close();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedSampleTutors();
}

module.exports = { seedSampleTutors };
