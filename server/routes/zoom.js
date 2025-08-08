const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken } = require('./auth');
const nodemailer = require('nodemailer');
const { createZoomMeeting, createPermanentMeetingRoom } = require('../utils/zoomApi');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Configure email transporter (you'll need to set up your email credentials)
// For now, we'll just log the emails instead of sending them
const transporter = null;

// Create Zoom meeting and send calendar invites
router.post('/create-meeting', authenticateToken, async (req, res) => {
  const { sessionId } = req.body;
  
  if (req.user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can create meetings' });
  }

  const db = new sqlite3.Database(dbPath);
  
  try {
    // Get session details
    const sessionQuery = `
      SELECT s.*, 
             tutee.name as tutee_name, tutee.email as tutee_email,
             tutor.name as tutor_name, tutor.email as tutor_email,
             r.title as reading_title
      FROM sessions s
      JOIN users tutee ON s.tutee_id = tutee.id
      JOIN users tutor ON s.tutor_id = tutor.id
      JOIN readings r ON s.reading_id = r.id
      WHERE s.id = ? AND s.tutor_id = ?
    `;

    db.get(sessionQuery, [sessionId, req.user.userId], async (err, session) => {
      if (err || !session) {
        db.close();
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status !== 'scheduled') {
        db.close();
        return res.status(400).json({ error: 'Session must be scheduled to create meeting' });
      }

      try {
        // Create Zoom meeting using real API (with fallback)
        const zoomMeeting = await createZoomMeeting(session);
        
        // Update session with Zoom details
        const updateQuery = `
          UPDATE sessions 
          SET zoom_meeting_id = ?, zoom_join_url = ?, zoom_start_url = ?
          WHERE id = ?
        `;
        
        db.run(updateQuery, [
          zoomMeeting.id,
          zoomMeeting.join_url,
          zoomMeeting.start_url,
          sessionId
        ], async function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Failed to update session with Zoom details' });
          }

          // Send calendar invites
          await sendCalendarInvites(session, zoomMeeting);
          
          db.close();
          res.json({ 
            message: 'Zoom meeting created and calendar invites sent',
            meeting: zoomMeeting
          });
        });
      } catch (error) {
        db.close();
        console.error('Error creating Zoom meeting:', error);
        res.status(500).json({ error: 'Failed to create Zoom meeting' });
      }
    });
  } catch (error) {
    db.close();
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session Zoom details
router.get('/session/:sessionId', authenticateToken, (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.userId;
  
  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT s.*, 
           tutee.name as tutee_name, tutee.email as tutee_email,
           tutor.name as tutor_name, tutor.email as tutor_email,
           r.title as reading_title
    FROM sessions s
    JOIN users tutee ON s.tutee_id = tutee.id
    JOIN users tutor ON s.tutor_id = tutor.id
    JOIN readings r ON s.reading_id = r.id
    WHERE s.id = ? AND (s.tutee_id = ? OR s.tutor_id = ?)
  `;
  
  db.get(query, [sessionId, userId, userId], (err, session) => {
    db.close();
    if (err || !session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    res.json({
      session,
      canJoin: canJoinSession(session.session_date),
      timeUntilStart: getTimeUntilStart(session.session_date)
    });
  });
});



// Send calendar invites to both participants
async function sendCalendarInvites(session, zoomMeeting) {
  const sessionDate = new Date(session.session_date);
  const startTime = sessionDate.toISOString();
  const endTime = new Date(sessionDate.getTime() + session.duration_minutes * 60000).toISOString();
  
  const calendarEvent = {
    summary: `GenConnect Session: ${session.reading_title}`,
    description: `Technology tutoring session with ${session.tutor_name} and ${session.tutee_name}.\n\nReading: ${session.reading_title}\n\nJoin Zoom Meeting:\n${zoomMeeting.join_url}\n\nMeeting ID: ${zoomMeeting.id}\nPassword: ${zoomMeeting.password}`,
    start: {
      dateTime: startTime,
      timeZone: 'America/Los_Angeles'
    },
    end: {
      dateTime: endTime,
      timeZone: 'America/Los_Angeles'
    },
    attendees: [
      { email: session.tutee_email },
      { email: session.tutor_email }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 15 } // 15 minutes before
      ]
    }
  };

  // Send email to tutee
  const tuteeMailOptions = {
    from: process.env.EMAIL_USER || 'noreply@genconnect.com',
    to: session.tutee_email,
    subject: `Session Scheduled: ${session.reading_title}`,
    html: `
      <h2>Your GenConnect session has been scheduled!</h2>
      <p><strong>Tutor:</strong> ${session.tutor_name}</p>
      <p><strong>Reading:</strong> ${session.reading_title}</p>
      <p><strong>Date & Time:</strong> ${sessionDate.toLocaleString()}</p>
      <p><strong>Duration:</strong> ${session.duration_minutes} minutes</p>
      <br>
      <p><strong>Join Zoom Meeting:</strong></p>
      <p><a href="${zoomMeeting.join_url}">${zoomMeeting.join_url}</a></p>
      <p><strong>Meeting ID:</strong> ${zoomMeeting.id}</p>
      <p><strong>Password:</strong> ${zoomMeeting.password}</p>
      <br>
      <p><strong>Demo Mode:</strong> You can join the session anytime for testing.</p>
      <p>See you there!</p>
    `
  };

  // Send email to tutor
  const tutorMailOptions = {
    from: process.env.EMAIL_USER || 'noreply@genconnect.com',
    to: session.tutor_email,
    subject: `Session Scheduled: ${session.reading_title}`,
    html: `
      <h2>Your GenConnect session has been scheduled!</h2>
      <p><strong>Student:</strong> ${session.tutee_name}</p>
      <p><strong>Reading:</strong> ${session.reading_title}</p>
      <p><strong>Date & Time:</strong> ${sessionDate.toLocaleString()}</p>
      <p><strong>Duration:</strong> ${session.duration_minutes} minutes</p>
      <br>
      <p><strong>Start Zoom Meeting (Host):</strong></p>
      <p><a href="${zoomMeeting.start_url}">${zoomMeeting.start_url}</a></p>
      <p><strong>Meeting ID:</strong> ${zoomMeeting.id}</p>
      <p><strong>Password:</strong> ${zoomMeeting.password}</p>
      <br>
      <p><strong>Demo Mode:</strong> You can start the meeting anytime for testing.</p>
      <p>Good luck with your session!</p>
    `
  };

  try {
    // For now, just log the emails (since we don't have email credentials set up)
    console.log('Would send email to tutee:', tuteeMailOptions);
    console.log('Would send email to tutor:', tutorMailOptions);
    console.log('Calendar invites would be sent successfully');
  } catch (error) {
    console.error('Error sending calendar invites:', error);
  }
}

// Check if session can be joined (demo mode - always allow)
function canJoinSession(sessionDate) {
  // For demo purposes, always allow joining
  return true;
}

// Get time until session starts
function getTimeUntilStart(sessionDate) {
  const now = new Date();
  const sessionTime = new Date(sessionDate);
  const diff = sessionTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Session has started';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m until session starts`;
  } else {
    return `${minutes}m until session starts`;
  }
}

module.exports = router;
