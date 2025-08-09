const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken } = require('./auth');
const { createCalendarEventWithMeet } = require('../utils/googleCalendar');

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
      console.log('Database error fetching requests, using demo mode:', err.message);
      
      // Return demo pending requests for Alex Chen (tutor ID 2)
      if (tutorId === 2) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        // Use tomorrow at 2 PM for demo request
        const demoSessionDate = new Date();
        demoSessionDate.setDate(demoSessionDate.getDate() + 1);
        demoSessionDate.setHours(14, 0, 0, 0);
        
        const demoRequests = [
          {
            id: 610, // Match the demo session ID we created
            tutee_id: 1,
            tutor_id: 2,
            reading_id: 1,
            session_date: demoSessionDate.toISOString(),
            duration_minutes: 20,
            status: 'pending',
            tutee_name: 'Betty Johnson',
            tech_comfort_level: 'beginner',
            reading_title: 'Online Grocery Shopping Basics',
            reading_summary: 'Learn the basics of shopping for groceries online with confidence.',
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
            demo_mode: true
          }
        ];
        
        console.log(`📋 Demo pending requests for tutor ${tutorId}:`, demoRequests.length);
        return res.json(demoRequests);
      } else {
        // No demo requests for other tutors
        return res.json([]);
      }
    }
    
    // Filter out expired requests
    const now = new Date();
    const validRequests = requests.filter(request => {
      return new Date(request.expires_at) > now;
    });
    
    // If no pending requests found for Alex Chen, return demo request
    if (tutorId === 2 && validRequests.length === 0) {
      console.log('No pending requests found for Alex Chen, returning demo request');
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      // Use tomorrow at 2 PM for demo request
      const demoSessionDate = new Date();
      demoSessionDate.setDate(demoSessionDate.getDate() + 1);
      demoSessionDate.setHours(14, 0, 0, 0);
      
      const demoRequests = [
        {
          id: 610, // Match the demo session ID we created
          tutee_id: 1,
          tutor_id: 2,
          reading_id: 1,
          session_date: demoSessionDate.toISOString(),
          duration_minutes: 20,
          status: 'pending',
          tutee_name: 'Betty Johnson',
          tech_comfort_level: 'beginner',
          reading_title: 'Online Grocery Shopping Basics',
          reading_summary: 'Learn the basics of shopping for groceries online with confidence.',
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          demo_mode: true
        }
      ];
      
      return res.json(demoRequests);
    }
    
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
  
  db.get(checkQuery, [id, tutorId], async (err, request) => {
    if (err) {
      console.log('Database error checking request, using demo mode:', err.message);
      db.close();
      
      // Demo mode: accept the demo request
      if (id == 610 && tutorId === 2) {
        try {
          // Create mock session data for Google Meet
          const mockSession = {
            id: 610,
            tutee_name: 'Betty Johnson',
            tutee_email: 'rachelchen0211@gmail.com',
            tutor_name: 'Alex Chen', 
            tutor_email: 'rachel_chen@berkeley.edu',
            reading_title: 'Online Grocery Shopping Basics',
            session_date: demoDate.toISOString(),
            duration_minutes: 20
          };
          
          console.log('📅 Creating demo Google Meet for session:', mockSession.id);
          
          // Create actual Google Calendar event with Google Meet
          const calendarResult = await createCalendarEventWithMeet(
            mockSession,
            mockSession.tutor_email,
            mockSession.tutee_email
          );
          
          console.log('✅ Demo session accepted with Google Meet:', calendarResult.meeting_id);
          
          return res.json({ 
            message: 'Request accepted successfully. Google Calendar event created with Google Meet and invites sent.',
            meeting: calendarResult,
            calendar_event: calendarResult.calendar_event,
            demo_mode: true
          });
        } catch (error) {
          console.error('Error creating demo Google Meet:', error);
          return res.json({ 
            message: 'Request accepted successfully',
            demo_mode: true,
            note: 'Google Meet creation failed, but request was accepted'
          });
        }
      } else {
        return res.status(404).json({ error: 'Request not found or already processed' });
      }
    }
    
    if (!request) {
      db.close();
      
      // Check if this is the demo request
      if (id == 610 && tutorId === 2) {
        try {
          // Create mock session data for Google Meet
          const mockSession = {
            id: 610,
            tutee_name: 'Betty Johnson',
            tutee_email: 'rachelchen0211@gmail.com',
            tutor_name: 'Alex Chen', 
            tutor_email: 'rachel_chen@berkeley.edu',
            reading_title: 'Online Grocery Shopping Basics',
            session_date: demoDate.toISOString(),
            duration_minutes: 20
          };
          
          console.log('📅 Creating demo Google Meet for session:', mockSession.id);
          
          // Create actual Google Calendar event with Google Meet
          const calendarResult = await createCalendarEventWithMeet(
            mockSession,
            mockSession.tutor_email,
            mockSession.tutee_email
          );
          
          console.log('✅ Demo session accepted with Google Meet:', calendarResult.meeting_id);
          
          return res.json({ 
            message: 'Request accepted successfully. Google Calendar event created with Google Meet and invites sent.',
            meeting: calendarResult,
            calendar_event: calendarResult.calendar_event,
            demo_mode: true
          });
        } catch (error) {
          console.error('Error creating demo Google Meet:', error);
          return res.json({ 
            message: 'Request accepted successfully',
            demo_mode: true,
            note: 'Google Meet creation failed, but request was accepted'
          });
        }
      }
      
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
            // Create Google Calendar event with Google Meet
            const calendarResult = await createCalendarEventWithMeet(
              session, 
              session.tutor_email, 
              session.tutee_email
            );
            
            // Update session with Google Meet details
            const updateQuery = `
              UPDATE sessions 
              SET zoom_meeting_id = ?, zoom_join_url = ?, zoom_start_url = ?
              WHERE id = ?
            `;
            
            db.run(updateQuery, [
              calendarResult.meeting_id,
              calendarResult.meet_url,
              calendarResult.meet_url, // Same URL for both join and start
              id
            ], async function(err) {
              if (err) {
                console.error('Failed to update session with Google Meet details:', err);
              }
              
              db.close();
              res.json({ 
                message: 'Request accepted successfully. Google Calendar event created with Google Meet and invites sent.',
                meeting: calendarResult,
                calendar_event: calendarResult.calendar_event
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
    if (err) {
      console.log('Database error fetching stats, using demo mode:', err.message);
      db.close();
      
      // Return demo stats for Alex Chen (tutor ID 2)
      if (tutorId === 2) {
        return res.json({
          pending_count: 1, // The demo request
          scheduled_count: 0,
          completed_count: 0,
          demo_mode: true
        });
      } else {
        return res.json({
          pending_count: 0,
          scheduled_count: 0,
          completed_count: 0,
          demo_mode: true
        });
      }
    }
    
    db.close();
    res.json(stats);
  });
});



// Send calendar invites to both participants
// Calendar invites are now handled by googleCalendar.js utility

module.exports = router;
