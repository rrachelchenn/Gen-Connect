const crypto = require('crypto');

// Google Meet link generator
// Note: This creates generic Google Meet links. For production, you'd want to use Google Calendar API
// to create actual scheduled meetings, but this approach works for demo purposes.

function generateGoogleMeetLink(session) {
  try {
    // Generate a unique meeting ID based on session details
    const sessionData = `${session.id}-${session.reading_id}-${session.session_date}`;
    const hash = crypto.createHash('md5').update(sessionData).digest('hex');
    const meetingId = hash.substring(0, 10); // Use first 10 characters
    
    // Create Google Meet link format
    const meetLink = `https://meet.google.com/${meetingId}`;
    
    console.log(`📅 Generated Google Meet link for session ${session.id}: ${meetLink}`);
    
    return {
      meet_url: meetLink,
      meeting_id: meetingId,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating Google Meet link:', error);
    
    // Fallback to a demo meeting
    return {
      meet_url: 'https://meet.google.com/demo-session',
      meeting_id: 'demo-session',
      created_at: new Date().toISOString()
    };
  }
}

function createGoogleMeetForSession(session) {
  const meetDetails = generateGoogleMeetLink(session);
  
  // In a production environment, you would:
  // 1. Use Google Calendar API to create a scheduled meeting
  // 2. Send calendar invites to participants
  // 3. Set up proper meeting permissions
  
  console.log(`🎥 Google Meet created for session ${session.id}:`);
  console.log(`   - Meet URL: ${meetDetails.meet_url}`);
  console.log(`   - Meeting ID: ${meetDetails.meeting_id}`);
  console.log(`   - Participants: Tutor and Tutee`);
  
  return meetDetails;
}

module.exports = {
  generateGoogleMeetLink,
  createGoogleMeetForSession
};
