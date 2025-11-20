const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'genconnect.db');

async function seedSampleTutors() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('🎓 Starting tutor seeding process...');
    
    // First ensure the tables exist
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS tutor_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        age INTEGER,
        industry TEXT,
        specialties TEXT,
        hourly_rate DECIMAL(6,2) DEFAULT 25.00,
        total_sessions INTEGER DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        total_reviews INTEGER DEFAULT 0,
        tutoring_style TEXT,
        availability_hours TEXT,
        experience_years INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
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
      )`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('📝 Tables created, hashing password...');
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Real tutors from Elder Welfare Mentorship program
    // Note: Emails are anonymized for privacy - tutees should use the contact form to reach tutors
    const sampleTutors = [
      {
        email: 'tutor1@genconnect.org',
        name: 'Jonny Luo',
        college: 'UC Berkeley',
        major: 'Energy Engineering',
        bio: 'I love talking to people and sharing life stories over coffee. My grandparents are all in China, so I understand the importance of connection across generations. I enjoy baking, jigsaw puzzles, hiking, and anything outdoors. I\'m patient with technology and love helping people learn new skills in a fun, relaxed way.',
        age: 19,
        industry: 'Engineering',
        specialties: ['Smartphone Basics', 'Internet Safety', 'Email & Messaging', 'Computer Basics'],
        total_sessions: 12,
        average_rating: 4.7,
        total_reviews: 8,
        tutoring_style: 'Spontaneous and goofy approach. I love making learning fun and creating a comfortable environment where we can chat about life while learning technology together.',
        availability_hours: 'Weekdays 10am-1pm, Evenings, Weekends',
        experience_years: 0
      },
      {
        email: 'tutor2@genconnect.org',
        name: 'Stephen Chase',
        college: 'UC Berkeley',
        major: 'Urban Studies',
        bio: 'I\'m very close to my grandparents and have volunteered at senior centers throughout middle and high school. I speak Spanish and American Sign Language, which helps me connect with people from different backgrounds. I\'m passionate about creating meaningful connections and providing companionship along with technology support.',
        age: 20,
        industry: 'Urban Planning',
        specialties: ['Smartphone Basics', 'Video Calling', 'Computer Basics', 'Internet Safety', 'Google Suite'],
        total_sessions: 28,
        average_rating: 4.9,
        total_reviews: 14,
        tutoring_style: 'Kind, funny, and dedicated. I focus on making deeper-level connections and prefer in-person meetings. I can help in English, Spanish, or ASL.',
        availability_hours: 'Afternoons and evenings, Weekends 9am-1pm',
        experience_years: 1
      },
      {
        email: 'tutor3@genconnect.org',
        name: 'Natalie Shin',
        college: 'UC Berkeley',
        major: 'Business Administration & Data Science',
        bio: 'I served as my grandma and grandpa\'s caretaker, and I\'ve learned that companionship is sometimes the most important thing. I love elderly citizens - they\'ve lived full lives and are so endearing. I enjoy crocheting, taekwondo, baking, mahjong, geocaching, and piano. I speak Mandarin fluently and Cantonese proficiently.',
        age: 19,
        industry: 'Business',
        specialties: ['Smartphone Basics', 'Online Shopping', 'Video Calling', 'Computer Basics', 'Google Suite'],
        total_sessions: 35,
        average_rating: 4.8,
        total_reviews: 18,
        tutoring_style: 'Bubbly, caring, and resilient. I\'m especially good with seniors looking for companionship along with tech help. Patient and encouraging approach.',
        availability_hours: 'Flexible most days, Full weekends available',
        experience_years: 0
      },
      {
        email: 'tutor4@genconnect.org',
        name: 'Carlin Voong',
        college: 'UC Berkeley',
        major: 'Psychology & Legal Studies',
        bio: 'I\'m passionate about bridging the gap between different communities and sharing stories. I believe in learning from the experiences and journeys of others. I enjoy watching shows, listening to podcasts, cooking, reading, playing video games, and volleyball.',
        age: 21,
        industry: 'Psychology',
        specialties: ['Smartphone Basics', 'Internet Safety', 'Email & Messaging', 'Video Calling'],
        total_sessions: 15,
        average_rating: 4.6,
        total_reviews: 9,
        tutoring_style: 'Charismatic, talkative, and insightful. I focus on making technology approachable and enjoy having conversations while teaching.',
        availability_hours: 'Afternoons 2pm-6pm, Weekend mornings',
        experience_years: 0
      },
      {
        email: 'tutor5@genconnect.org',
        name: 'Shalini Sathi',
        college: 'UC Berkeley',
        major: 'Integrative Biology',
        bio: 'I used to have breakfast with my grandfather every day before he passed from Alzheimer\'s. I understand firsthand how lack of tech fluency can lead to elders feeling disconnected. I\'m passionate about helping seniors stay independent and connected with their loved ones. I love baking, reading, gardening, and playing violin.',
        age: 19,
        industry: 'Healthcare',
        specialties: ['Video Calling', 'Email & Messaging', 'Internet Safety', 'Smartphone Basics', 'Google Suite'],
        total_sessions: 22,
        average_rating: 4.9,
        total_reviews: 12,
        tutoring_style: 'Inquisitive, warm, and nature-loving. I take a patient and gentle approach, understanding that technology can be challenging but is essential for staying connected.',
        availability_hours: 'Limited weekdays, Weekends 10am-1pm',
        experience_years: 0
      },
      {
        email: 'tutor6@genconnect.org',
        name: 'Lauren Jung',
        college: 'UC Berkeley',
        major: 'Applied Mathematics & Data Science',
        bio: 'I\'m passionate about teaching what I know to help others fit into our fast-growing digital world. I enjoy golf, beach activities, running with my dog, hiking, and spending time in parks. I have advanced technology skills and love sharing my knowledge.',
        age: 21,
        industry: 'Technology',
        specialties: ['Smartphone Basics', 'Computer Basics', 'Internet Safety', 'Email & Messaging', 'Google Suite'],
        total_sessions: 31,
        average_rating: 4.7,
        total_reviews: 16,
        tutoring_style: 'Loving, caring, and mindful. I use my strong technical background to make complex topics simple and accessible.',
        availability_hours: 'Limited weekdays, Full weekends available',
        experience_years: 0
      },
      {
        email: 'tutor7@genconnect.org',
        name: 'Rylee Cheney',
        college: 'UC Berkeley',
        major: 'Psychology & Public Policy',
        bio: 'I grew up just a street away from my grandparents and was always their go-to for tech help. I\'m passionate about empowering and supporting my community. I enjoy hiking, reading, graphic design, and watching crime documentaries. I\'m also involved in mentoring elementary kids through SAGE at Berkeley.',
        age: 21,
        industry: 'Psychology',
        specialties: ['Smartphone Basics', 'Computer Basics', 'Video Calling', 'Internet Safety'],
        total_sessions: 42,
        average_rating: 4.8,
        total_reviews: 21,
        tutoring_style: 'Funny, empathetic, and kind. I bring mentoring experience and understand the importance of patience when teaching technology.',
        availability_hours: 'Mornings and early afternoons, Weekend mornings',
        experience_years: 1
      },
      {
        email: 'tutor8@genconnect.org',
        name: 'Amy Li',
        college: 'UC Berkeley',
        major: 'Molecular & Cell Biology',
        bio: 'I\'m pre-health and passionate about giving back through mentorship. I\'ve grown up receiving mentorship and now want to be on the other end. I love building Legos and puzzles - I find it calming to put pieces together to create something bigger, just like building connections with people.',
        age: 20,
        industry: 'Healthcare',
        specialties: ['Smartphone Basics', 'Video Calling', 'Google Suite', 'Internet Safety'],
        total_sessions: 18,
        average_rating: 4.6,
        total_reviews: 10,
        tutoring_style: 'Ambitious, intuitive, and considerate. I take a methodical, step-by-step approach to teaching, similar to solving puzzles.',
        availability_hours: 'Limited weekdays, mornings preferred',
        experience_years: 0
      },
      {
        email: 'tutor9@genconnect.org',
        name: 'Saloni Rajput',
        college: 'UC Berkeley',
        major: 'Microbial Biology',
        bio: 'I\'m pre-med and deeply motivated by bridging generational gaps. I believe in the power of empathy and patience, which are crucial in medicine and in teaching. I love learning about diseases, dancing, doing gel-x nails, and meeting new people. I\'m passionate about empowering seniors with technology to enhance their independence.',
        age: 21,
        industry: 'Healthcare',
        specialties: ['Smartphone Basics', 'Video Calling', 'Internet Safety', 'Email & Messaging'],
        total_sessions: 25,
        average_rating: 4.7,
        total_reviews: 13,
        tutoring_style: 'Empathetic, tenacious, and optimistic. I bring a holistic approach where both mentor and mentee grow together.',
        availability_hours: 'Mornings and afternoons, Weekends available',
        experience_years: 0
      },
      {
        email: 'tutor10@genconnect.org',
        name: 'Janelle Hon',
        college: 'UC Berkeley',
        major: 'Film & Media Studies, Psychology',
        bio: 'I\'m passionate about cross-generational relationships and building connections with experienced people. I love hiking, trying different foods, doing art, journaling, swimming, playing badminton, and taking photos/videos. I hope to work in film production and bring creativity to everything I do.',
        age: 20,
        industry: 'Film & Media',
        specialties: ['Smartphone Basics', 'Video Calling', 'Photo Sharing', 'Social Media'],
        total_sessions: 19,
        average_rating: 4.8,
        total_reviews: 11,
        tutoring_style: 'Empathetic, flexible, and attentive. I use my creative background to make technology fun and engaging.',
        availability_hours: 'Flexible schedule, afternoons and weekends',
        experience_years: 0
      },
      {
        email: 'tutor11@genconnect.org',
        name: 'Brian Yee',
        college: 'UC Berkeley',
        major: 'Molecular Environmental Biology',
        bio: 'I\'m pre-med with interests in hematology/oncology. I\'m passionate about learning from people with diverse backgrounds. I enjoy reading, playing video games, watching popular shows, trying new recipes, and going on hikes. I want to develop my communication and collaboration skills while volunteering.',
        age: 20,
        industry: 'Healthcare',
        specialties: ['Smartphone Basics', 'Computer Basics', 'Internet Safety', 'Email & Messaging', 'Google Suite', 'Video Calling'],
        total_sessions: 27,
        average_rating: 4.9,
        total_reviews: 15,
        tutoring_style: 'Calm, diligent, and understanding. I have advanced tech skills across all platforms and enjoy teaching in a relaxed, friendly manner.',
        availability_hours: 'Evenings during week, Flexible weekends',
        experience_years: 0
      },
      {
        email: 'tutor12@genconnect.org',
        name: 'Nathalie Luna',
        college: 'UC Berkeley',
        major: 'Integrative Biology',
        bio: 'I love helping people and being around elderly people who share similar hobbies. I enjoy reading fiction and non-fiction, writing, binge-watching TV shows, volunteering at animal shelters, thrifting, and listening to music on my record player. I\'m going into veterinary medicine or biology-related graduate school.',
        age: 20,
        industry: 'Biology',
        specialties: ['Smartphone Basics', 'Internet Safety', 'Email & Messaging', 'Video Calling'],
        total_sessions: 14,
        average_rating: 4.5,
        total_reviews: 8,
        tutoring_style: 'Kind, driven, and easy-going. I focus on building friendships and finding common hobbies while teaching technology.',
        availability_hours: 'Limited availability, mainly evenings',
        experience_years: 0
      },
      {
        email: 'tutor13@genconnect.org',
        name: 'Gabriela Li',
        college: 'UC Berkeley',
        major: 'MCB & Public Health',
        bio: 'Raised by my grandmother, I have a strong bond with elderly people. I\'m an EMT and health interpreter, helping patients feel comfortable during difficult times. I understand how technology helps seniors stay connected with family far away. I enjoy playing soccer, cooking, baking, and trying different coffee shops.',
        age: 20,
        industry: 'Healthcare',
        specialties: ['Smartphone Basics', 'Video Calling', 'Email & Messaging', 'Internet Safety'],
        total_sessions: 33,
        average_rating: 4.9,
        total_reviews: 17,
        tutoring_style: 'Outgoing, organized, and thoughtful. I bring healthcare experience and understand how to make people feel comfortable and supported.',
        availability_hours: 'Flexible throughout week, Good weekend availability',
        experience_years: 0
      },
      {
        email: 'tutor14@genconnect.org',
        name: 'Elizabeth Gonzalez',
        college: 'UC Berkeley',
        major: 'Statistics & Psychology',
        bio: 'I\'m a bit of an old soul thanks to my family being on the older side. I get along well with older adults and am intrigued by their perspectives. I enjoy music (playing and listening), action comics, horror movies and games, psychology research, and dystopian novels. Elders have so much life to share.',
        age: 19,
        industry: 'Psychology',
        specialties: ['Smartphone Basics', 'Internet Safety', 'Email & Messaging', 'Video Calling'],
        total_sessions: 16,
        average_rating: 4.6,
        total_reviews: 9,
        tutoring_style: 'Curious, eager, and compassionate. I focus on learning from elders while teaching them technology, creating a mutual exchange.',
        availability_hours: 'Evenings and weekends preferred',
        experience_years: 0
      },
      {
        email: 'tutor15@genconnect.org',
        name: 'Ashley Mei',
        college: 'UC Berkeley',
        major: 'Business Administration',
        bio: 'I spent a lot of time with my grandparents growing up and owe them so much. Helping elders is an opportunity to give back what I couldn\'t when I was younger. I enjoy playing badminton, doing puzzles of any sort, sleeping, and playing video games. I\'m studying to be an accountant.',
        age: 19,
        industry: 'Business',
        specialties: ['Smartphone Basics', 'Computer Basics', 'Internet Safety', 'Email & Messaging', 'Google Suite'],
        total_sessions: 21,
        average_rating: 4.7,
        total_reviews: 11,
        tutoring_style: 'Dedicated, considerate, and family-oriented. I bring patience and a genuine desire to help seniors feel confident with technology.',
        availability_hours: 'Flexible most days, Full weekends',
        experience_years: 0
      },
      {
        email: 'tutor16@genconnect.org',
        name: 'Karen Nguyen',
        college: 'UC Berkeley',
        major: 'Business & Economics',
        bio: 'I believe meaningful companionship is more important than ever in our digital age. I\'m passionate about real estate, video games, cars, makeup, and shopping - down for everything and anything! I speak Vietnamese and am learning Turkish. I want to open a size-inclusive clothing brand and car-themed coffee shops.',
        age: 20,
        industry: 'Business',
        specialties: ['Smartphone Basics', 'Computer Basics', 'Internet Safety', 'Video Calling', 'Social Media', 'Google Suite'],
        total_sessions: 29,
        average_rating: 4.8,
        total_reviews: 14,
        tutoring_style: 'Open-minded, caring, and extroverted-introvert. I have advanced tech skills and can help seniors feel less isolated in our digital world.',
        availability_hours: 'Fridays evenings, Weekends 10am-12pm',
        experience_years: 0
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
             (user_id, age, industry, specialties, total_sessions, 
              average_rating, total_reviews, tutoring_style, availability_hours, experience_years)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId, tutor.age, tutor.industry, JSON.stringify(tutor.specialties),
              tutor.total_sessions, tutor.average_rating,
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
      { tutor_email: 'tutor3@genconnect.org', reviewer_name: 'Margaret Chen', rating: 5, comment: 'Natalie was so sweet and patient! She helped me learn to video call my grandchildren. Her bubbly personality made me feel comfortable.', session_topic: 'Video Calling' },
      { tutor_email: 'tutor2@genconnect.org', reviewer_name: 'Robert Wilson', rating: 5, comment: 'Stephen is wonderful! He even helped me in Spanish when I struggled with English terms. Very kind young man.', session_topic: 'Smartphone Basics' },
      { tutor_email: 'tutor5@genconnect.org', reviewer_name: 'Dorothy Miller', rating: 5, comment: 'Shalini understood my frustrations with technology. She was so patient and gentle. I can now email my daughter!', session_topic: 'Email & Messaging' },
      { tutor_email: 'tutor6@genconnect.org', reviewer_name: 'Frank Davis', rating: 5, comment: 'Lauren has excellent technical knowledge but explains things in simple terms. Very caring and mindful of my pace.', session_topic: 'Internet Safety' },
      { tutor_email: 'tutor11@genconnect.org', reviewer_name: 'Helen Brown', rating: 5, comment: 'Brian is so calm and understanding. He never made me feel bad for asking questions multiple times.', session_topic: 'Computer Basics' },
      { tutor_email: 'tutor13@genconnect.org', reviewer_name: 'Patricia Garcia', rating: 5, comment: 'Gabriela reminds me of my own granddaughter. She was so thoughtful and helped me stay connected with my family overseas.', session_topic: 'Video Calling' },
      { tutor_email: 'tutor7@genconnect.org', reviewer_name: 'William Martinez', rating: 5, comment: 'Rylee is funny and made learning enjoyable. Her experience really shows - she knows how to teach!', session_topic: 'Smartphone Basics' },
      { tutor_email: 'tutor1@genconnect.org', reviewer_name: 'James Thompson', rating: 4, comment: 'Jonny made learning fun! His approach is refreshing and he really took time to understand what I needed help with.', session_topic: 'Email & Messaging' },
      { tutor_email: 'tutor9@genconnect.org', reviewer_name: 'Mary Anderson', rating: 5, comment: 'Saloni is empathetic and patient. She never rushed me and made sure I understood everything before moving on.', session_topic: 'Smartphone Basics' },
      { tutor_email: 'tutor10@genconnect.org', reviewer_name: 'George White', rating: 5, comment: 'Janelle was creative in her teaching approach. She helped me share photos with my family!', session_topic: 'Photo Sharing' },
      { tutor_email: 'tutor4@genconnect.org', reviewer_name: 'Barbara Lee', rating: 4, comment: 'Carlin is very talkative and made the session enjoyable. I learned a lot!', session_topic: 'Video Calling' },
      { tutor_email: 'tutor15@genconnect.org', reviewer_name: 'David Kim', rating: 5, comment: 'Ashley is so considerate and patient. She really cares about making sure you understand.', session_topic: 'Computer Basics' }
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

    console.log('✅ Sample tutors and reviews seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding tutors:', error);
    throw error; // Re-throw so calling function knows it failed
  } finally {
    db.close();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedSampleTutors();
}

module.exports = { seedSampleTutors };
