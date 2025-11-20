const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Safely import email notifications - won't crash if unavailable
let sendContactRequestNotification = async () => { console.log('⚠️ Email notifications disabled'); return false; };
let sendTutorApplicationNotification = async () => { console.log('⚠️ Email notifications disabled'); return false; };

try {
  const emailModule = require('../utils/emailNotifications');
  sendContactRequestNotification = emailModule.sendContactRequestNotification;
  sendTutorApplicationNotification = emailModule.sendTutorApplicationNotification;
  console.log('✅ Email notifications loaded successfully');
} catch (error) {
  console.warn('⚠️ Email notifications unavailable:', error.message);
}

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// In-memory storage for Vercel serverless environment
const contactRequests = [];
const tutorApplications = [];

// Discussion articles/lessons for senior citizens
const discussionArticles = [
  {
    id: 1,
    title: 'Sending Your First Text Message',
    description: 'Learn the basics of texting - from opening your messages app to sending photos and emojis to family.',
    category: 'Communication',
    difficulty: 'Beginner',
    estimated_time: '30 minutes',
    topics: ['Smartphone Basics', 'Texting', 'Emojis', 'Group Messages'],
    content: 'Master the art of staying in touch with family through text messaging. We\'ll cover how to start a conversation, send photos, use emojis, and manage group chats.'
  },
  {
    id: 2,
    title: 'Video Calling with FaceTime & Zoom',
    description: 'See your loved ones face-to-face no matter the distance. Learn how to make video calls on your phone or computer.',
    category: 'Communication',
    difficulty: 'Beginner',
    estimated_time: '45 minutes',
    topics: ['Video Calling', 'FaceTime', 'Zoom', 'Family Connection'],
    content: 'Connect with family through video calls. We\'ll walk through setting up FaceTime on your iPhone, joining Zoom meetings, and troubleshooting common issues like audio and camera settings.'
  },
  {
    id: 3,
    title: 'Online Banking Safety & Security',
    description: 'Safely manage your finances online while protecting yourself from scams and fraud.',
    category: 'Finance',
    difficulty: 'Intermediate',
    estimated_time: '60 minutes',
    topics: ['Online Banking', 'Security', 'Fraud Prevention', 'Two-Factor Authentication'],
    content: 'Learn to bank online with confidence. We\'ll cover logging in securely, checking balances, paying bills, and most importantly - how to spot and avoid phishing scams and fraud attempts.'
  },
  {
    id: 4,
    title: 'Avoiding Email & Phone Scams',
    description: 'Recognize red flags and protect yourself from common scams targeting seniors.',
    category: 'Safety',
    difficulty: 'Beginner',
    estimated_time: '45 minutes',
    topics: ['Internet Safety', 'Scam Prevention', 'Email Security', 'Phone Safety'],
    content: 'Protect yourself from scammers with this essential guide. Learn to identify phishing emails, suspicious phone calls, fake tech support scams, and what to do if you think you\'ve been targeted.'
  },
  {
    id: 5,
    title: 'Using Facebook to Stay Connected',
    description: 'Join Facebook to see what your grandchildren are up to and share your own updates.',
    category: 'Social Media',
    difficulty: 'Beginner',
    estimated_time: '60 minutes',
    topics: ['Social Media', 'Facebook', 'Photo Sharing', 'Privacy Settings'],
    content: 'Get started with Facebook and stay connected with family. We\'ll create your account, add friends, post photos, comment on updates, and adjust privacy settings so you\'re comfortable.'
  },
  {
    id: 6,
    title: 'Shopping Safely on Amazon',
    description: 'Order groceries, essentials, and gifts online with confidence and security.',
    category: 'Shopping',
    difficulty: 'Intermediate',
    estimated_time: '45 minutes',
    topics: ['Online Shopping', 'Amazon', 'Payment Security', 'Returns'],
    content: 'Master online shopping with Amazon. Learn to search for products, read reviews, compare prices, checkout securely, track packages, and handle returns or issues.'
  },
  {
    id: 7,
    title: 'Taking & Organizing Photos on Your Phone',
    description: 'Capture memories and keep your photo library organized and backed up.',
    category: 'Photography',
    difficulty: 'Beginner',
    estimated_time: '45 minutes',
    topics: ['Photo Sharing', 'Camera', 'Photo Organization', 'Cloud Backup'],
    content: 'Take great photos and keep them organized. We\'ll cover camera basics, creating albums, editing photos, backing up to the cloud, and sharing with family.'
  },
  {
    id: 8,
    title: 'Setting Up Your Smart Home Devices',
    description: 'Control lights, thermostat, and more with voice commands using Alexa or Google Home.',
    category: 'Smart Home',
    difficulty: 'Intermediate',
    estimated_time: '60 minutes',
    topics: ['Smart Home', 'Voice Assistants', 'Alexa', 'Google Home'],
    content: 'Make your home smarter and more convenient. Learn to set up Alexa or Google Home, control smart lights and thermostats, set reminders, play music, and ask questions.'
  },
  {
    id: 9,
    title: 'Navigating with Google Maps',
    description: 'Never get lost again - learn to use GPS navigation on your smartphone.',
    category: 'Navigation',
    difficulty: 'Beginner',
    estimated_time: '30 minutes',
    topics: ['Smartphone Basics', 'Navigation', 'Google Maps', 'Directions'],
    content: 'Use your phone as a GPS navigator. We\'ll cover entering addresses, following turn-by-turn directions, finding nearby places, and saving favorite locations.'
  },
  {
    id: 10,
    title: 'Managing Your Email Inbox',
    description: 'Keep your email organized, delete spam, and find important messages quickly.',
    category: 'Communication',
    difficulty: 'Beginner',
    estimated_time: '45 minutes',
    topics: ['Email & Messaging', 'Organization', 'Spam Filtering', 'Attachments'],
    content: 'Tame your inbox and stay organized. Learn to compose emails, reply to messages, manage folders, filter spam, open attachments safely, and search for old emails.'
  },
  {
    id: 11,
    title: 'Using Venmo & Digital Payments',
    description: 'Send and receive money digitally with friends and family.',
    category: 'Finance',
    difficulty: 'Intermediate',
    estimated_time: '45 minutes',
    topics: ['Digital Payments', 'Venmo', 'PayPal', 'Security'],
    content: 'Join the digital payment revolution safely. We\'ll set up Venmo or PayPal, link your bank account, send and request money, and discuss security best practices.'
  },
  {
    id: 12,
    title: 'Creating a Photo Book or Calendar',
    description: 'Turn your digital photos into beautiful printed keepsakes.',
    category: 'Photography',
    difficulty: 'Intermediate',
    estimated_time: '60 minutes',
    topics: ['Photo Sharing', 'Photo Books', 'Shutterfly', 'Gifts'],
    content: 'Create lasting memories with photo books and calendars. Learn to use services like Shutterfly or Costco Photo Center to design and order custom photo products.'
  }
];

// Sample tutor data for fallback (when database is read-only)
// These match the real tutors seeded in the database
const sampleTutorsData = [
  {
    id: 100,
    email: 'tutor1@genconnect.org',
    name: 'Jonny Luo',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Energy Engineering',
    bio: 'I love talking to people and sharing life stories over coffee. My grandparents are all in China, so I understand the importance of connection across generations. I enjoy baking, jigsaw puzzles, hiking, and anything outdoors. I\'m patient with technology and love helping people learn new skills in a fun, relaxed way.',
    age: 19,
    industry: 'Engineering',
    specialties: ['Smartphone Basics', 'Internet Safety', 'Email & Messaging', 'Computer Basics'],
    favorite_lessons: [1, 4, 10, 9],
    total_sessions: 12,
    average_rating: 4.7,
    total_reviews: 8,
    tutoring_style: 'Spontaneous and goofy approach. I love making learning fun and creating a comfortable environment where we can chat about life while learning technology together.',
    availability_hours: 'Weekdays 10am-1pm, Evenings, Weekends',
    experience_years: 0
  },
  {
    id: 101,
    email: 'tutor2@genconnect.org',
    name: 'Stephen Chase',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Urban Studies',
    bio: 'I\'m very close to my grandparents and have volunteered at senior centers throughout middle and high school. I speak Spanish and American Sign Language, which helps me connect with people from different backgrounds. I\'m passionate about creating meaningful connections and providing companionship along with technology support.',
    age: 20,
    industry: 'Urban Planning',
    specialties: ['Smartphone Basics', 'Video Calling', 'Computer Basics', 'Internet Safety'],
    favorite_lessons: [1, 2, 9, 4],
    total_sessions: 28,
    average_rating: 4.9,
    total_reviews: 14,
    tutoring_style: 'Kind, funny, and dedicated. I focus on making deeper-level connections and prefer in-person meetings. I can help in English, Spanish, or ASL.',
    availability_hours: 'Afternoons and evenings, Weekends 9am-1pm',
    experience_years: 1
  },
  {
    id: 102,
    email: 'tutor3@genconnect.org',
    name: 'Natalie Shin',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Business Administration & Data Science',
    bio: 'I served as my grandma and grandpa\'s caretaker, and I\'ve learned that companionship is sometimes the most important thing. I love elderly citizens - they\'ve lived full lives and are so endearing. I enjoy crocheting, taekwondo, baking, mahjong, geocaching, and piano. I speak Mandarin fluently and Cantonese proficiently.',
    age: 19,
    industry: 'Business',
    specialties: ['Smartphone Basics', 'Online Shopping', 'Video Calling', 'Computer Basics'],
    favorite_lessons: [1, 6, 2, 7],
    total_sessions: 35,
    average_rating: 4.8,
    total_reviews: 18,
    tutoring_style: 'Bubbly, caring, and resilient. I\'m especially good with seniors looking for companionship along with tech help. Patient and encouraging approach.',
    availability_hours: 'Flexible most days, Full weekends available',
    experience_years: 0
  },
  {
    id: 103,
    email: 'tutor4@genconnect.org',
    name: 'Carlin Voong',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Psychology & Legal Studies',
    bio: 'I\'m passionate about bridging the gap between different communities and sharing stories. I believe in learning from the experiences and journeys of others. I enjoy watching shows, listening to podcasts, cooking, reading, playing video games, and volleyball.',
    age: 21,
    industry: 'Psychology',
    specialties: ['Smartphone Basics', 'Internet Safety', 'Email & Messaging', 'Video Calling'],
    favorite_lessons: [1, 4, 10, 2],
    total_sessions: 15,
    average_rating: 4.6,
    total_reviews: 9,
    tutoring_style: 'Charismatic, talkative, and insightful. I focus on making technology approachable and enjoy having conversations while teaching.',
    availability_hours: 'Afternoons 2pm-6pm, Weekend mornings',
    experience_years: 0
  },
  {
    id: 104,
    email: 'tutor5@genconnect.org',
    name: 'Shalini Sathi',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Integrative Biology',
    bio: 'I used to have breakfast with my grandfather every day before he passed from Alzheimer\'s. I understand firsthand how lack of tech fluency can lead to elders feeling disconnected. I\'m passionate about helping seniors stay independent and connected with their loved ones. I love baking, reading, gardening, and playing violin.',
    age: 19,
    industry: 'Healthcare',
    specialties: ['Video Calling', 'Email & Messaging', 'Internet Safety', 'Smartphone Basics'],
    favorite_lessons: [2, 10, 4, 1],
    total_sessions: 22,
    average_rating: 4.9,
    total_reviews: 12,
    tutoring_style: 'Inquisitive, warm, and nature-loving. I take a patient and gentle approach, understanding that technology can be challenging but is essential for staying connected.',
    availability_hours: 'Limited weekdays, Weekends 10am-1pm',
    experience_years: 0
  },
  {
    id: 105,
    email: 'tutor6@genconnect.org',
    name: 'Lauren Jung',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Applied Mathematics & Data Science',
    bio: 'I\'m passionate about teaching what I know to help others fit into our fast-growing digital world. I enjoy golf, beach activities, running with my dog, hiking, and spending time in parks. I have advanced technology skills and love sharing my knowledge.',
    age: 21,
    industry: 'Technology',
    specialties: ['Smartphone Basics', 'Computer Basics', 'Internet Safety', 'Email & Messaging'],
    favorite_lessons: [1, 9, 4, 10],
    total_sessions: 31,
    average_rating: 4.7,
    total_reviews: 16,
    tutoring_style: 'Loving, caring, and mindful. I use my strong technical background to make complex topics simple and accessible.',
    availability_hours: 'Limited weekdays, Full weekends available',
    experience_years: 0
  },
  {
    id: 106,
    email: 'tutor7@genconnect.org',
    name: 'Rylee Cheney',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Psychology & Public Policy',
    bio: 'I grew up just a street away from my grandparents and was always their go-to for tech help. I\'m passionate about empowering and supporting my community. I enjoy hiking, reading, graphic design, and watching crime documentaries. I\'m also involved in mentoring elementary kids through SAGE at Berkeley.',
    age: 21,
    industry: 'Psychology',
    specialties: ['Smartphone Basics', 'Computer Basics', 'Video Calling', 'Internet Safety'],
    favorite_lessons: [1, 9, 2, 4],
    total_sessions: 42,
    average_rating: 4.8,
    total_reviews: 21,
    tutoring_style: 'Funny, empathetic, and kind. I bring mentoring experience and understand the importance of patience when teaching technology.',
    availability_hours: 'Mornings and early afternoons, Weekend mornings',
    experience_years: 1
  },
  {
    id: 107,
    email: 'tutor8@genconnect.org',
    name: 'Amy Li',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Molecular & Cell Biology',
    bio: 'I\'m pre-health and passionate about giving back through mentorship. I\'ve grown up receiving mentorship and now want to be on the other end. I love building Legos and puzzles - I find it calming to put pieces together to create something bigger, just like building connections with people.',
    age: 20,
    industry: 'Healthcare',
    specialties: ['Smartphone Basics', 'Video Calling', 'Internet Safety'],
    favorite_lessons: [1, 2, 4, 7],
    total_sessions: 18,
    average_rating: 4.6,
    total_reviews: 10,
    tutoring_style: 'Ambitious, intuitive, and considerate. I take a methodical, step-by-step approach to teaching, similar to solving puzzles.',
    availability_hours: 'Limited weekdays, mornings preferred',
    experience_years: 0
  },
  {
    id: 108,
    email: 'tutor9@genconnect.org',
    name: 'Saloni Rajput',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Microbial Biology',
    bio: 'I\'m pre-med and deeply motivated by bridging generational gaps. I believe in the power of empathy and patience, which are crucial in medicine and in teaching. I love learning about diseases, dancing, doing gel-x nails, and meeting new people. I\'m passionate about empowering seniors with technology to enhance their independence.',
    age: 21,
    industry: 'Healthcare',
    specialties: ['Smartphone Basics', 'Video Calling', 'Internet Safety', 'Email & Messaging'],
    favorite_lessons: [1, 2, 4, 10],
    total_sessions: 25,
    average_rating: 4.7,
    total_reviews: 13,
    tutoring_style: 'Empathetic, tenacious, and optimistic. I bring a holistic approach where both mentor and mentee grow together.',
    availability_hours: 'Mornings and afternoons, Weekends available',
    experience_years: 0
  },
  {
    id: 109,
    email: 'tutor10@genconnect.org',
    name: 'Janelle Hon',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Film & Media Studies, Psychology',
    bio: 'I\'m passionate about cross-generational relationships and building connections with experienced people. I love hiking, trying different foods, doing art, journaling, swimming, playing badminton, and taking photos/videos. I hope to work in film production and bring creativity to everything I do.',
    age: 20,
    industry: 'Film & Media',
    specialties: ['Smartphone Basics', 'Video Calling', 'Photo Sharing', 'Social Media'],
    favorite_lessons: [7, 2, 5, 12],
    total_sessions: 19,
    average_rating: 4.8,
    total_reviews: 11,
    tutoring_style: 'Empathetic, flexible, and attentive. I use my creative background to make technology fun and engaging.',
    availability_hours: 'Flexible schedule, afternoons and weekends',
    experience_years: 0
  },
  {
    id: 110,
    email: 'tutor11@genconnect.org',
    name: 'Brian Yee',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Molecular Environmental Biology',
    bio: 'I\'m pre-med with interests in hematology/oncology. I\'m passionate about learning from people with diverse backgrounds. I enjoy reading, playing video games, watching popular shows, trying new recipes, and going on hikes. I want to develop my communication and collaboration skills while volunteering.',
    age: 20,
    industry: 'Healthcare',
    specialties: ['Smartphone Basics', 'Computer Basics', 'Internet Safety', 'Email & Messaging', 'Video Calling'],
    favorite_lessons: [1, 9, 4, 10, 2],
    total_sessions: 27,
    average_rating: 4.9,
    total_reviews: 15,
    tutoring_style: 'Calm, diligent, and understanding. I have advanced tech skills across all platforms and enjoy teaching in a relaxed, friendly manner.',
    availability_hours: 'Evenings during week, Flexible weekends',
    experience_years: 0
  },
  {
    id: 111,
    email: 'tutor12@genconnect.org',
    name: 'Nathalie Luna',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Integrative Biology',
    bio: 'I love helping people and being around elderly people who share similar hobbies. I enjoy reading fiction and non-fiction, writing, binge-watching TV shows, volunteering at animal shelters, thrifting, and listening to music on my record player. I\'m going into veterinary medicine or biology-related graduate school.',
    age: 20,
    industry: 'Biology',
    specialties: ['Smartphone Basics', 'Internet Safety', 'Email & Messaging', 'Video Calling'],
    favorite_lessons: [1, 4, 10, 2],
    total_sessions: 14,
    average_rating: 4.5,
    total_reviews: 8,
    tutoring_style: 'Kind, driven, and easy-going. I focus on building friendships and finding common hobbies while teaching technology.',
    availability_hours: 'Limited availability, mainly evenings',
    experience_years: 0
  },
  {
    id: 112,
    email: 'tutor13@genconnect.org',
    name: 'Gabriela Li',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'MCB & Public Health',
    bio: 'Raised by my grandmother, I have a strong bond with elderly people. I\'m an EMT and health interpreter, helping patients feel comfortable during difficult times. I understand how technology helps seniors stay connected with family far away. I enjoy playing soccer, cooking, baking, and trying different coffee shops.',
    age: 20,
    industry: 'Healthcare',
    specialties: ['Smartphone Basics', 'Video Calling', 'Email & Messaging', 'Internet Safety'],
    favorite_lessons: [1, 2, 10, 4],
    total_sessions: 33,
    average_rating: 4.9,
    total_reviews: 17,
    tutoring_style: 'Outgoing, organized, and thoughtful. I bring healthcare experience and understand how to make people feel comfortable and supported.',
    availability_hours: 'Flexible throughout week, Good weekend availability',
    experience_years: 0
  },
  {
    id: 113,
    email: 'tutor14@genconnect.org',
    name: 'Elizabeth Gonzalez',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Statistics & Psychology',
    bio: 'I\'m a bit of an old soul thanks to my family being on the older side. I get along well with older adults and am intrigued by their perspectives. I enjoy music (playing and listening), action comics, horror movies and games, psychology research, and dystopian novels. Elders have so much life to share.',
    age: 19,
    industry: 'Psychology',
    specialties: ['Smartphone Basics', 'Internet Safety', 'Email & Messaging', 'Video Calling'],
    favorite_lessons: [1, 4, 10, 2],
    total_sessions: 16,
    average_rating: 4.6,
    total_reviews: 9,
    tutoring_style: 'Curious, eager, and compassionate. I focus on learning from elders while teaching them technology, creating a mutual exchange.',
    availability_hours: 'Evenings and weekends preferred',
    experience_years: 0
  },
  {
    id: 114,
    email: 'tutor15@genconnect.org',
    name: 'Ashley Mei',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Business Administration',
    bio: 'I spent a lot of time with my grandparents growing up and owe them so much. Helping elders is an opportunity to give back what I couldn\'t when I was younger. I enjoy playing badminton, doing puzzles of any sort, sleeping, and playing video games. I\'m studying to be an accountant.',
    age: 19,
    industry: 'Business',
    specialties: ['Smartphone Basics', 'Computer Basics', 'Internet Safety', 'Email & Messaging'],
    favorite_lessons: [1, 9, 4, 10],
    total_sessions: 21,
    average_rating: 4.7,
    total_reviews: 11,
    tutoring_style: 'Dedicated, considerate, and family-oriented. I bring patience and a genuine desire to help seniors feel confident with technology.',
    availability_hours: 'Flexible most days, Full weekends',
    experience_years: 0
  },
  {
    id: 115,
    email: 'tutor16@genconnect.org',
    name: 'Karen Nguyen',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Business & Economics',
    bio: 'I believe meaningful companionship is more important than ever in our digital age. I\'m passionate about real estate, video games, cars, makeup, and shopping - down for everything and anything! I speak Vietnamese and am learning Turkish. I want to open a size-inclusive clothing brand and car-themed coffee shops.',
    age: 20,
    industry: 'Business',
    specialties: ['Smartphone Basics', 'Computer Basics', 'Internet Safety', 'Video Calling', 'Social Media'],
    favorite_lessons: [1, 9, 4, 2, 5],
    total_sessions: 29,
    average_rating: 4.8,
    total_reviews: 14,
    tutoring_style: 'Open-minded, caring, and extroverted-introvert. I have advanced tech skills and can help seniors feel less isolated in our digital world.',
    availability_hours: 'Fridays evenings, Weekends 10am-12pm',
    experience_years: 0
  }
];

const sampleReviewsData = [
  { id: 1, tutor_id: 100, reviewer_name: 'Margaret Johnson', rating: 5, comment: 'Amara was incredibly patient and helped me set up my iPhone. She wrote everything down step by step. Now I can text my grandchildren!', session_topic: 'Smartphone Basics', date: '2025-01-15' },
  { id: 2, tutor_id: 100, reviewer_name: 'Robert Wilson', rating: 5, comment: 'Excellent teacher. Made FaceTime so easy to understand. I talk to my daughter in New York every week now!', session_topic: 'Video Calling', date: '2025-01-10' },
  { id: 3, tutor_id: 101, reviewer_name: 'Dorothy Smith', rating: 5, comment: 'Marcus helped me feel confident about online shopping and banking. Very knowledgeable about security. I feel safe shopping on Amazon now.', session_topic: 'Online Shopping', date: '2025-01-20' },
  { id: 4, tutor_id: 101, reviewer_name: 'Charles Anderson', rating: 4, comment: 'Great session on online banking. Marcus showed me how to check my account and pay bills online. Very practical approach.', session_topic: 'Online Banking', date: '2025-01-25' },
  { id: 5, tutor_id: 102, reviewer_name: 'Barbara Miller', rating: 5, comment: 'Sofia is wonderful! So patient and kind. She never made me feel rushed. I can now video call my grandchildren regularly!', session_topic: 'Video Calling', date: '2025-01-18' },
  { id: 6, tutor_id: 102, reviewer_name: 'Helen Brown', rating: 5, comment: 'Very helpful with email setup. Sofia took her time to make sure I understood everything. She even helped me organize my inbox!', session_topic: 'Email & Messaging', date: '2025-01-12' },
  { id: 7, tutor_id: 103, reviewer_name: 'Patricia Garcia', rating: 5, comment: 'James made learning my new phone so easy! He created a cheat sheet for me that I keep by my phone. Very helpful young man.', session_topic: 'Smartphone Basics', date: '2025-01-22' },
  { id: 8, tutor_id: 103, reviewer_name: 'George Thompson', rating: 4, comment: 'Good teacher. Helped me understand how to take and share photos with my family. A bit fast-paced but he slowed down when I asked.', session_topic: 'Photo Sharing', date: '2025-01-16' },
  { id: 9, tutor_id: 104, reviewer_name: 'Linda Chen', rating: 5, comment: 'Priya taught me how to use Facebook to see what my grandkids are posting. She was so patient and made it fun! Now I can keep up with everyone.', session_topic: 'Social Media', date: '2025-01-14' },
  { id: 10, tutor_id: 104, reviewer_name: 'Richard Lee', rating: 5, comment: 'Excellent instructor! Priya helped me set up Zoom so I can join my book club meetings. Very knowledgeable and patient.', session_topic: 'Video Calling', date: '2025-01-19' },
  { id: 11, tutor_id: 105, reviewer_name: 'Carol White', rating: 5, comment: 'Tyler taught me how to spot scam emails and protect my information. I feel much safer online now. He really knows his stuff!', session_topic: 'Internet Safety', date: '2025-01-21' },
  { id: 12, tutor_id: 105, reviewer_name: 'Frank Davis', rating: 5, comment: 'Great help with online banking security. Tyler showed me how to set up two-factor authentication. Very thorough!', session_topic: 'Online Banking', date: '2025-01-11' },
  { id: 13, tutor_id: 106, reviewer_name: 'Nancy Rodriguez', rating: 5, comment: 'Maya made learning Instagram so fun! She helped me post my first photo and now I share pictures of my garden all the time.', session_topic: 'Social Media', date: '2025-01-17' },
  { id: 14, tutor_id: 107, reviewer_name: 'William Martinez', rating: 5, comment: 'Ethan has a gift for teaching. He made email and internet basics simple and easy to follow. Never felt rushed or judged.', session_topic: 'Email & Messaging', date: '2025-01-13' },
  { id: 15, tutor_id: 107, reviewer_name: 'Susan Taylor', rating: 5, comment: 'Best tutor I\'ve had! Ethan adapted to my learning pace and explained everything clearly. I finally understand how to use my computer!', session_topic: 'Computer Basics', date: '2025-01-24' },
  { id: 16, tutor_id: 108, reviewer_name: 'Edward Brown', rating: 5, comment: 'Olivia created such a comfortable learning environment. I never felt embarrassed to ask questions. She taught me how to video call my son overseas!', session_topic: 'Video Calling', date: '2025-01-09' }
];

// Get all tutors for browsing - query database
router.get('/browse', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT 
      users.id,
      users.email,
      users.name,
      users.role,
      users.college,
      users.major,
      users.bio,
      tutor_profiles.age,
      tutor_profiles.industry,
      tutor_profiles.specialties,
      tutor_profiles.total_sessions,
      tutor_profiles.average_rating,
      tutor_profiles.total_reviews,
      tutor_profiles.tutoring_style,
      tutor_profiles.availability_hours,
      tutor_profiles.experience_years
    FROM users
    INNER JOIN tutor_profiles ON users.id = tutor_profiles.user_id
    WHERE users.role = 'tutor'
    ORDER BY users.name
  `;
  
  db.all(query, [], (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Database error, falling back to sample data:', err);
      return res.json(sampleTutorsData);
    }
    
    if (!rows || rows.length === 0) {
      console.log('No tutors in database, returning sample data');
      return res.json(sampleTutorsData);
    }
    
    // Parse specialties JSON and format data
    const tutors = rows.map(row => ({
      ...row,
      specialties: typeof row.specialties === 'string' ? JSON.parse(row.specialties) : row.specialties,
      favorite_lessons: [] // Optional field
    }));
    
    console.log(`✅ Returning ${tutors.length} tutors from database`);
    res.json(tutors);
  });
});

// Get all discussion articles/lessons
router.get('/articles', (req, res) => {
  try {
    console.log('✅ Returning discussion articles');
    res.json(discussionArticles);
  } catch (error) {
    console.error('Error in /articles:', error);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

// Get a specific article by ID
router.get('/articles/:articleId', (req, res) => {
  try {
    const { articleId } = req.params;
    const article = discussionArticles.find(a => a.id == articleId);
    if (article) {
      console.log(`✅ Returning article ${articleId}`);
      res.json(article);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.error('Error in /articles/:articleId:', error);
    res.status(500).json({ error: 'Failed to load article' });
  }
});

// Handle tutor applications (no auth required)
router.post('/apply', async (req, res) => {
  const { name, email, phone, college, major, age, specialties, bio, availability, experience, why_tutor } = req.body;
  
  if (!name || !email || !phone || !college || !major || !age || !specialties || !bio || !availability || !why_tutor) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Create application object
  const application = {
    id: Date.now(),
    name,
    email,
    phone,
    college,
    major,
    age,
    specialties: Array.isArray(specialties) ? specialties : JSON.parse(specialties),
    bio,
    availability,
    experience: experience || '',
    why_tutor,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  // Store in memory
  tutorApplications.push(application);
  
  // Log to Vercel console
  console.log('🎓 NEW TUTOR APPLICATION:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone}`);
  console.log(`College: ${college}`);
  console.log(`Major: ${major}`);
  console.log(`Age: ${age}`);
  console.log(`Specialties: ${Array.isArray(specialties) ? specialties.join(', ') : specialties}`);
  console.log(`Availability: ${availability}`);
  console.log(`Why: ${why_tutor.substring(0, 100)}...`);
  console.log(`Timestamp: ${application.created_at}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Try to send email with 3 second timeout, then respond
  const emailTimeout = new Promise((resolve) => setTimeout(() => {
    console.log('⏱️ Email timeout - responding anyway');
    resolve(false);
  }, 3000));
  
  const emailPromise = sendTutorApplicationNotification(application).catch(err => {
    console.error('Email notification failed:', err);
    return false;
  });
  
  // Wait for email or timeout (whichever comes first)
  await Promise.race([emailPromise, emailTimeout]);
  
  // Return success
  res.json({ 
    success: true, 
    message: 'Application submitted successfully',
    applicationId: application.id
  });
});

// Handle contact form submissions (no auth required)
router.post('/contact', async (req, res) => {
  const { tutorId, name, email, phone, message, preferredTopics } = req.body;
  
  if (!tutorId || !name || !email || !phone || !preferredTopics) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Create contact request object
  const contactRequest = {
    id: Date.now(),
    tutor_id: tutorId,
    name,
    email,
    phone,
    preferred_topics: preferredTopics,
    message: message || '',
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  // Store in memory
  contactRequests.push(contactRequest);
  
  // Find tutor name
  const tutor = sampleTutorsData.find(t => t.id == tutorId);
  const tutorName = tutor ? tutor.name : `Tutor #${tutorId}`;
  
  // Log to Vercel console (you can view this in Vercel dashboard -> Functions -> Logs)
  console.log('📬 NEW CONTACT REQUEST:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`From: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone}`);
  console.log(`Tutor: ${tutorName} (ID: ${tutorId})`);
  console.log(`Interested in: ${preferredTopics}`);
  if (message) console.log(`Message: ${message}`);
  console.log(`Timestamp: ${contactRequest.created_at}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Try to send email with 3 second timeout, then respond
  const emailTimeout = new Promise((resolve) => setTimeout(() => {
    console.log('⏱️ Email timeout - responding anyway');
    resolve(false);
  }, 3000));
  
  const emailPromise = sendContactRequestNotification({
    ...contactRequest,
    tutorName,
    preferredTopics
  }).catch(err => {
    console.error('Email notification failed:', err);
    return false;
  });
  
  // Wait for email or timeout (whichever comes first)
  await Promise.race([emailPromise, emailTimeout]);
  
  // Return success
  res.json({ 
    success: true, 
    message: 'Contact request submitted successfully',
    requestId: contactRequest.id
  });
});

// Get contact requests for a tutor (no auth for demo)
router.get('/:tutorId/contact-requests', (req, res) => {
  const { tutorId } = req.params;
  
  // Filter requests for this tutor from in-memory storage
  const tutorRequests = contactRequests.filter(req => req.tutor_id == tutorId);
  
  console.log(`✅ Fetched ${tutorRequests.length} contact requests for tutor ${tutorId}`);
  res.json(tutorRequests);
});

// Update contact request status (in-memory)
router.patch('/contact-requests/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;
  
  if (!status || !['pending', 'contacted', 'scheduled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  // Find and update the request in memory
  const request = contactRequests.find(r => r.id == requestId);
  if (request) {
    request.status = status;
    console.log(`✅ Updated contact request ${requestId} to ${status}`);
    res.json({ success: true, message: 'Status updated' });
  } else {
    res.status(404).json({ error: 'Request not found' });
  }
});

// Get tutor reviews
// Get tutor reviews - simplified for Vercel
router.get('/:tutorId/reviews', (req, res) => {
  try {
    const { tutorId } = req.params;
    const tutorReviews = sampleReviewsData.filter(review => review.tutor_id == tutorId);
    console.log(`✅ Returning ${tutorReviews.length} reviews for tutor ${tutorId}`);
    res.json(tutorReviews);
  } catch (error) {
    console.error('Error in /reviews:', error);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

module.exports = router;
