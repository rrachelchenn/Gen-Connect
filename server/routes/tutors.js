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

// Sample tutor data for fallback (when database is read-only)
const sampleTutorsData = [
  {
    id: 100,
    email: 'amara.johnson@berkeley.edu',
    name: 'Amara Johnson',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Electrical Engineering & Computer Sciences',
    bio: 'I\'m a junior in EECS at Berkeley with a passion for teaching. I grew up helping my grandparents navigate their first smartphones, and I love making technology feel approachable and fun. Whether it\'s setting up your iPhone or learning to video chat, I\'m here to help you feel confident!',
    age: 20,
    industry: 'Technology',
    specialties: ['Smartphone Basics', 'Video Calling', 'Email & Messaging', 'Photo Sharing'],
    hourly_rate: 25.00,
    total_sessions: 42,
    average_rating: 4.9,
    total_reviews: 14,
    tutoring_style: 'Patient and encouraging with lots of practice. I believe in learning by doing, and I always write down step-by-step instructions for you to keep.',
    availability_hours: 'Tuesday and Thursday afternoons, Saturday mornings',
    experience_years: 2
  },
  {
    id: 101,
    email: 'marcus.williams@berkeley.edu',
    name: 'Marcus Williams',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Business Administration (Haas)',
    bio: 'As a Haas business student, I understand how important it is to stay connected in today\'s world. I specialize in practical applications like online banking, shopping safely on Amazon, and using apps like Venmo. I make sure you understand not just how, but why things work the way they do.',
    age: 21,
    industry: 'Business',
    specialties: ['Online Banking', 'Online Shopping', 'Internet Safety', 'Smartphone Basics'],
    hourly_rate: 28.00,
    total_sessions: 38,
    average_rating: 4.8,
    total_reviews: 12,
    tutoring_style: 'Practical and hands-on. We\'ll use your actual accounts and devices so you\'re learning exactly what you need for your daily life.',
    availability_hours: 'Weekday afternoons and Sunday afternoons',
    experience_years: 2
  },
  {
    id: 102,
    email: 'sofia.patel@berkeley.edu',
    name: 'Sofia Patel',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Public Health',
    bio: 'I\'m studying Public Health with a focus on aging and wellness. I understand the unique challenges seniors face with technology, and I\'m incredibly patient. My grandma says I taught her everything she knows about her iPad! I love helping people stay connected with family and access important health information online.',
    age: 22,
    industry: 'Healthcare',
    specialties: ['Video Calling', 'Email & Messaging', 'Photo Sharing', 'Social Media'],
    hourly_rate: 23.00,
    total_sessions: 56,
    average_rating: 5.0,
    total_reviews: 18,
    tutoring_style: 'Gentle, patient, and supportive. I go at your pace and never rush. We can repeat things as many times as you need until you feel comfortable.',
    availability_hours: 'Flexible - mornings and evenings most days',
    experience_years: 3
  },
  {
    id: 103,
    email: 'james.nguyen@berkeley.edu',
    name: 'James Nguyen',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Data Science',
    bio: 'I\'m a data science major who loves breaking down complex topics into simple terms. I helped both my parents and grandparents transition to smartphones, and I know how overwhelming it can feel at first. I focus on the basics first - calling, texting, and photos - then we build from there based on what you want to learn.',
    age: 19,
    industry: 'Technology',
    specialties: ['Smartphone Basics', 'Photo Sharing', 'Email & Messaging', 'Computer Basics'],
    hourly_rate: 22.00,
    total_sessions: 34,
    average_rating: 4.7,
    total_reviews: 11,
    tutoring_style: 'Step-by-step with lots of repetition. I create simple cheat sheets you can refer to later, and I\'m always available for follow-up questions.',
    availability_hours: 'Monday, Wednesday, Friday afternoons',
    experience_years: 1
  },
  {
    id: 104,
    email: 'priya.sharma@berkeley.edu',
    name: 'Priya Sharma',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Cognitive Science',
    bio: 'As a cognitive science student, I study how people learn and remember information. I use these principles to make tech training stick! I especially love teaching social media basics like Facebook and Instagram so you can see what your grandkids are up to, and video calling so you can stay in touch with family far away.',
    age: 20,
    industry: 'Education',
    specialties: ['Social Media', 'Video Calling', 'Smartphone Basics', 'Email & Messaging'],
    hourly_rate: 24.00,
    total_sessions: 47,
    average_rating: 4.9,
    total_reviews: 15,
    tutoring_style: 'Learning science-based approach with memory aids and practice. I make sure you actually remember what we cover, not just go through the motions.',
    availability_hours: 'Tuesday and Thursday evenings, weekends',
    experience_years: 2
  },
  {
    id: 105,
    email: 'tyler.chen@berkeley.edu',
    name: 'Tyler Chen',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Economics',
    bio: 'I\'m an economics major passionate about financial literacy and digital safety. I help seniors safely manage online banking, spot scams and phishing emails, and shop online with confidence. My own grandfather was scammed once, so I take online security very seriously and make sure you know how to protect yourself.',
    age: 21,
    industry: 'Finance',
    specialties: ['Online Banking', 'Internet Safety', 'Online Shopping', 'Email & Messaging'],
    hourly_rate: 26.00,
    total_sessions: 41,
    average_rating: 4.8,
    total_reviews: 13,
    tutoring_style: 'Security-first approach with clear explanations. I teach you how to recognize red flags and protect your personal information online.',
    availability_hours: 'Wednesday afternoons and weekends',
    experience_years: 2
  },
  {
    id: 106,
    email: 'maya.rodriguez@berkeley.edu',
    name: 'Maya Rodriguez',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Media Studies',
    bio: 'I\'m a media studies major who grew up helping my abuela learn technology. I focus on making social media and photo sharing fun and accessible. Whether you want to post pictures on Facebook, send photos to family, or just organize your phone\'s camera roll, I\'m here to help you capture and share your memories!',
    age: 22,
    industry: 'Design',
    specialties: ['Photo Sharing', 'Social Media', 'Smartphone Basics', 'Video Calling'],
    hourly_rate: 23.00,
    total_sessions: 39,
    average_rating: 4.9,
    total_reviews: 12,
    tutoring_style: 'Fun and creative! We\'ll take photos, share them with family, and learn by doing. Technology should be enjoyable, not stressful.',
    availability_hours: 'Afternoons Monday through Thursday',
    experience_years: 2
  },
  {
    id: 107,
    email: 'ethan.lee@berkeley.edu',
    name: 'Ethan Lee',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Information Science',
    bio: 'I\'m studying Information Science at Berkeley, focusing on how technology can be more accessible to everyone. I have extensive experience teaching older adults through volunteer work at senior centers in Oakland. I\'m patient, understanding, and truly enjoy seeing the moment when everything "clicks" for my students.',
    age: 23,
    industry: 'Technology',
    specialties: ['Computer Basics', 'Email & Messaging', 'Internet Safety', 'Online Shopping'],
    hourly_rate: 25.00,
    total_sessions: 63,
    average_rating: 5.0,
    total_reviews: 20,
    tutoring_style: 'Highly patient with a focus on accessibility. I adapt my teaching style to match how you learn best, and I never make you feel rushed.',
    availability_hours: 'Very flexible schedule - happy to work around your availability',
    experience_years: 3
  },
  {
    id: 108,
    email: 'olivia.kim@berkeley.edu',
    name: 'Olivia Kim',
    role: 'tutor',
    college: 'UC Berkeley',
    major: 'Psychology',
    bio: 'As a psychology major, I understand that learning new technology can feel intimidating, especially when it seems like everyone else already knows how. I create a judgment-free space where questions are always welcome. I taught my own parents and aunts how to use their smartphones, and I bring that same patience and care to every session.',
    age: 20,
    industry: 'Education',
    specialties: ['Smartphone Basics', 'Video Calling', 'Photo Sharing', 'Social Media'],
    hourly_rate: 22.00,
    total_sessions: 45,
    average_rating: 4.9,
    total_reviews: 16,
    tutoring_style: 'Encouraging and judgment-free. I celebrate every small victory and make sure you feel confident before moving on to the next topic.',
    availability_hours: 'Mornings and early afternoons most days',
    experience_years: 2
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

// Get all tutors for browsing - simplified for Vercel
router.get('/browse', (req, res) => {
  try {
    console.log('✅ Returning sample tutors');
    res.json(sampleTutorsData);
  } catch (error) {
    console.error('Error in /browse:', error);
    res.status(500).json({ error: 'Failed to load tutors' });
  }
});

// Handle tutor applications (no auth required)
router.post('/apply', (req, res) => {
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
  
  // Return success immediately (don't wait for email)
  res.json({ 
    success: true, 
    message: 'Application submitted successfully',
    applicationId: application.id
  });
  
  // Send email notification AFTER response (truly non-blocking)
  setImmediate(() => {
    sendTutorApplicationNotification(application).catch(err => {
      console.error('Email notification failed:', err);
    });
  });
});

// Handle contact form submissions (no auth required)
router.post('/contact', (req, res) => {
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
  
  // Return success immediately (don't wait for email)
  res.json({ 
    success: true, 
    message: 'Contact request submitted successfully',
    requestId: contactRequest.id
  });
  
  // Send email notification AFTER response (truly non-blocking)
  setImmediate(() => {
    sendContactRequestNotification({
      ...contactRequest,
      tutorName,
      preferredTopics
    }).catch(err => {
      console.error('Email notification failed:', err);
    });
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
