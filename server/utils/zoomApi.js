const axios = require('axios');
const jwt = require('jsonwebtoken');

// Zoom API configuration
const ZOOM_API_KEY = process.env.ZOOM_API_KEY || 'your-zoom-api-key';
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET || 'your-zoom-api-secret';
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID || 'your-zoom-account-id';

// Generate JWT token for Zoom API
function generateZoomJWT() {
  const payload = {
    iss: ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
  };
  
  return jwt.sign(payload, ZOOM_API_SECRET);
}

// Create a real Zoom meeting using the API
async function createZoomMeeting(session) {
  try {
    const token = generateZoomJWT();
    
    const meetingData = {
      topic: `GenConnect Session: ${session.reading_title}`,
      type: 2, // Scheduled meeting
      start_time: new Date(session.session_date).toISOString(),
      duration: session.duration_minutes,
      password: Math.random().toString(36).substring(2, 8),
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: false,
        watermark: false,
        use_pmi: false,
        approval_type: 0, // Automatically approve
        audio: 'both',
        auto_recording: 'none'
      }
    };

    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const meeting = response.data;
    
    return {
      id: meeting.id.toString(),
      join_url: meeting.join_url,
      start_url: meeting.start_url,
      password: meeting.password,
      type: 'real_zoom'
    };
  } catch (error) {
    console.error('Error creating Zoom meeting:', error.response?.data || error.message);
    
    // Fallback to demo meeting if API fails
    return createDemoMeeting(session);
  }
}

// Demo meeting (works without API credentials)
function createDemoMeeting(session) {
  // Use a known working demo meeting ID for testing
  // This is a placeholder - in production, use real Zoom API
  const meetingId = '12345678901'; // Demo meeting ID
  const password = 'demo123';
  
  const joinUrl = `https://zoom.us/j/${meetingId}?pwd=${password}`;
  const startUrl = `https://zoom.us/s/${meetingId}?pwd=${password}`;
  
  console.log(`🎯 Demo Mode: Using demo meeting ID ${meetingId}`);
  console.log(`📋 To use real Zoom meetings, set up API credentials as described in ZOOM_SETUP.md`);
  console.log(`🔗 Demo meeting URL: ${joinUrl}`);
  
  return {
    id: meetingId,
    join_url: joinUrl,
    start_url: startUrl,
    password: password,
    type: 'demo_meeting'
  };
}

// Alternative: Create a permanent meeting room
async function createPermanentMeetingRoom(session) {
  try {
    const token = generateZoomJWT();
    
    const meetingData = {
      topic: `GenConnect - ${session.reading_title}`,
      type: 8, // Recurring meeting with no fixed time
      password: Math.random().toString(36).substring(2, 8),
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: false,
        watermark: false,
        use_pmi: false,
        approval_type: 0,
        audio: 'both',
        auto_recording: 'none'
      }
    };

    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', meetingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const meeting = response.data;
    
    return {
      id: meeting.id.toString(),
      join_url: meeting.join_url,
      start_url: meeting.start_url,
      password: meeting.password,
      type: 'permanent_room'
    };
  } catch (error) {
    console.error('Error creating permanent meeting room:', error.response?.data || error.message);
    return createDemoMeeting(session);
  }
}

// Legacy fallback function (kept for compatibility)
function createFallbackMeeting(session) {
  return createDemoMeeting(session);
}

module.exports = {
  createZoomMeeting,
  createPermanentMeetingRoom,
  createFallbackMeeting,
  createDemoMeeting
};
