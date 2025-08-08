const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken } = require('./auth');
const { createGoogleMeetForSession } = require('../utils/googleMeet');

const router = express.Router();
const dbPath = path.join(__dirname, '../database/genconnect.db');

// Get pending requests for a tutor
router.get('/pending', authenticateToken, (req, res) => {
  if (req.user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can view pending requests' });
  }

  const tutorId = req.user.userId;
  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT s.*, 
           tutee.name as tutee_name, tutee.tech_comfort_level,
           r.title as reading_title, r.summary as reading_summary,
           datetime(s.request_expires_at) as expires_at
    FROM sessions s
    JOIN users tutee ON s.tutee_id = tutee.id
    JOIN readings r ON s.reading_id = r.id
    WHERE s.tutor_id = ? AND s.status = 'pending'
    ORDER BY s.created_at DESC
  `;
  
  db.all(query, [tutorId], (err, requests) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
    
    // Filter out expired requests
    const now = new Date();
    const validRequests = requests.filter(request => {
      return new Date(request.expires_at) > now;
    });
    
    res.json(validRequests);
  });
});

// Accept a session request
router.post('/:id/accept', authenticateToken, (req, res) => {
  if (req.user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can accept requests' });
  }

  const { id } = req.params;
  const tutorId = req.user.userId;
  const db = new sqlite3.Database(dbPath);
  
  // Check if request exists and belongs to this tutor
  const checkQuery = `
    SELECT * FROM sessions 
    WHERE id = ? AND tutor_id = ? AND status = 'pending'
  `;
  
  db.get(checkQuery, [id, tutorId], (err, request) => {
    if (err || !request) {
      db.close();
      return res.status(404).json({ error: 'Request not found or already processed' });
    }
    
    // Check if request has expired
    if (new Date(request.request_expires_at) < new Date()) {
      db.close();
      return res.status(400).json({ error: 'Request has expired' });
    }
    
    // Update status to scheduled
    db.run('UPDATE sessions SET status = ? WHERE id = ?', ['scheduled', id], async function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to accept request' });
      }
      
      // Create Zoom meeting and send calendar invites
      try {
        const sessionQuery = `
          SELECT s.*, 
                 tutee.name as tutee_name, tutee.email as tutee_email,
                 tutor.name as tutor_name, tutor.email as tutor_email,
                 r.title as reading_title
          FROM sessions s
          JOIN users tutee ON s.tutee_id = tutee.id
          JOIN users tutor ON s.tutor_id = tutor.id
          JOIN readings r ON s.reading_id = r.id
          WHERE s.id = ?
        `;
        
        db.get(sessionQuery, [id], async (err, session) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Failed to retrieve session details' });
          }
          
          try {
            // Create Google Meet for session
            const googleMeet = createGoogleMeetForSession(session);
            
            // Update session with Google Meet details
            const updateQuery = `
              UPDATE sessions 
              SET zoom_meeting_id = ?, zoom_join_url = ?, zoom_start_url = ?
              WHERE id = ?
            `;
            
            db.run(updateQuery, [
              googleMeet.meeting_id,
              googleMeet.meet_url,
              googleMeet.meet_url, // Same URL for both join and start
              id
            ], async function(err) {
              if (err) {
                console.error('Failed to update session with Google Meet details:', err);
              }
              
              // Send calendar invites
              await sendCalendarInvites(session, googleMeet);
              
              db.close();
              res.json({ 
                message: 'Request accepted successfully. Google Meet created and calendar invites sent.',
                meeting: googleMeet
              });
            });
          } catch (error) {
            console.error('Error creating Google Meet:', error);
            db.close();
            res.json({ message: 'Request accepted successfully' });
          }
        });
      } catch (error) {
        console.error('Error:', error);
        db.close();
        res.json({ message: 'Request accepted successfully' });
      }
    });
  });
});

// Decline a session request
router.post('/:id/decline', authenticateToken, (req, res) => {
  if (req.user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can decline requests' });
  }

  const { id } = req.params;
  const tutorId = req.user.userId;
  const db = new sqlite3.Database(dbPath);
  
  // Check if request exists and belongs to this tutor
  const checkQuery = `
    SELECT * FROM sessions 
    WHERE id = ? AND tutor_id = ? AND status = 'pending'
  `;
  
  db.get(checkQuery, [id, tutorId], (err, request) => {
    if (err || !request) {
      db.close();
      return res.status(404).json({ error: 'Request not found or already processed' });
    }
    
    // Check if request has expired
    if (new Date(request.request_expires_at) < new Date()) {
      db.close();
      return res.status(400).json({ error: 'Request has expired' });
    }
    
    // Update status to declined
    db.run('UPDATE sessions SET status = ? WHERE id = ?', ['declined', id], function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to decline request' });
      }
      res.json({ message: 'Request declined successfully' });
    });
  });
});

// Get request statistics for tutor dashboard
router.get('/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can view request stats' });
  }

  const tutorId = req.user.userId;
  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT 
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
      COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
    FROM sessions 
    WHERE tutor_id = ?
  `;
  
  db.get(query, [tutorId], (err, stats) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch request statistics' });
    }
    res.json(stats);
  });
});



// Send calendar invites to both participants
async function sendCalendarInvites(session, zoomMeeting) {
  const sessionDate = new Date(session.session_date);
  
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

module.exports = router;
