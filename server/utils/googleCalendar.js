const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// Google Calendar API integration for creating calendar events with Google Meet
// Note: This requires Google Calendar API credentials and service account setup

async function createCalendarEventWithMeet(session, tutorEmail, tuteeEmail) {
  try {
    // For demo purposes, we'll create a mock calendar event
    // In production, you'd set up Google Calendar API credentials
    
    const sessionDateTime = new Date(session.session_date);
    const endDateTime = new Date(sessionDateTime.getTime() + (session.duration_minutes * 60000));
    
    // Generate a unique meet link based on session details
    const sessionHash = require('crypto')
      .createHash('md5')
      .update(`${session.id}-${session.reading_id}-${sessionDateTime.getTime()}`)
      .digest('hex')
      .substring(0, 12);
    
    // Create a proper Google Meet URL format
    const meetUrl = `https://meet.google.com/${sessionHash.substring(0, 3)}-${sessionHash.substring(3, 7)}-${sessionHash.substring(7, 11)}`;
    
    const calendarEvent = {
      summary: `GenConnect Session: ${session.reading_title}`,
      description: `
📚 GenConnect Learning Session

📖 Topic: ${session.reading_title}
👩‍🎓 Tutor: ${session.tutor_name || 'Tutor'}
👨‍💻 Tutee: ${session.tutee_name || 'Student'}
⏱️ Duration: ${session.duration_minutes} minutes

📺 Join Google Meet: ${meetUrl}

📝 Session Details:
This is a personalized learning session to help with technology topics. The tutor will guide you through the reading material and answer any questions you have.

Please join the Google Meet at the scheduled time. The session workspace will also be available on the GenConnect website.
      `,
      start: {
        dateTime: sessionDateTime.toISOString(),
        timeZone: 'America/New_York', // You might want to make this configurable
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: [
        { email: tutorEmail },
        { email: tuteeEmail }
      ],
      conferenceData: {
        createRequest: {
          requestId: `genconnect-${session.id}-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 15 }, // 15 minutes before
        ],
      },
    };

    console.log(`📅 Created calendar event for session ${session.id}:`);
    console.log(`   - Event: ${calendarEvent.summary}`);
    console.log(`   - Time: ${sessionDateTime.toLocaleString()}`);
    console.log(`   - Google Meet: ${meetUrl}`);
    console.log(`   - Attendees: ${tutorEmail}, ${tuteeEmail}`);

    // For demo purposes, we'll send email invites manually
    await sendCalendarInviteEmails(calendarEvent, meetUrl, tutorEmail, tuteeEmail);

    return {
      calendar_event: calendarEvent,
      meet_url: meetUrl,
      meeting_id: sessionHash,
      created_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error creating calendar event with Google Meet:', error);
    
    // Fallback to basic meet link
    const fallbackMeetUrl = 'https://meet.google.com/new';
    return {
      calendar_event: null,
      meet_url: fallbackMeetUrl,
      meeting_id: 'fallback',
      created_at: new Date().toISOString()
    };
  }
}

async function sendCalendarInviteEmails(calendarEvent, meetUrl, tutorEmail, tuteeEmail) {
  try {
    // Create email transporter using Gmail (if credentials available)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      console.log('📧 No email credentials provided - calendar invite content logged instead');
      throw new Error('Email credentials not configured');
    }

    console.log('📧 Email credentials found, attempting to send emails...');
    console.log(`   User: ${emailUser}`);
    console.log(`   Pass length: ${emailPass.length} characters`);

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass.replace(/\s/g, '') // Remove any spaces from app password
      }
    });

    const emailContent = {
      subject: `📚 ${calendarEvent.summary} - Calendar Invite`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
            📚 GenConnect Session Invitation
          </h2>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Session Details</h3>
            <p><strong>📖 Topic:</strong> ${calendarEvent.summary.replace('GenConnect Session: ', '')}</p>
            <p><strong>📅 Date & Time:</strong> ${new Date(calendarEvent.start.dateTime).toLocaleString()}</p>
            <p><strong>⏱️ Duration:</strong> ${Math.round((new Date(calendarEvent.end.dateTime) - new Date(calendarEvent.start.dateTime)) / 60000)} minutes</p>
          </div>

          <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #16a34a; margin-top: 0;">🎥 Join the Session</h3>
            <a href="${meetUrl}" 
               style="display: inline-block; background-color: #4285f4; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
              Join Google Meet
            </a>
            <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">
              You can join this meeting from any device with a web browser. No downloads required!
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
              <strong>Meet Link:</strong> ${meetUrl}
            </p>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #d97706; margin-top: 0;">📝 Session Workspace</h3>
            <p>In addition to the video call, you'll have access to the session workspace on GenConnect.live where you can:</p>
            <ul style="color: #374151;">
              <li>View the reading material with proper formatting</li>
              <li>See discussion questions and answers</li>
              <li>Take collaborative notes during the session</li>
            </ul>
            <p style="font-size: 14px; color: #6b7280;">
              Visit your dashboard on GenConnect.live and click "📚 Open Session Workspace" when it's time for your session.
            </p>
          </div>

          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">⚠️ Important Notes</h3>
            <p style="color: #374151; margin-bottom: 10px;">This is a <strong>demo calendar invite</strong> for testing purposes:</p>
            <ul style="color: #374151;">
              <li>The Google Meet link may not be a real active meeting room</li>
              <li>This demonstrates the calendar invite email functionality</li>
              <li>In production, this would create actual Google Calendar events</li>
            </ul>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #6b7280;">
            <p><strong>Need help?</strong> Contact us through the GenConnect platform if you have any questions.</p>
            <p>This invitation was sent by GenConnect - Bridging the Digital Divide</p>
          </div>
        </div>
      `
    };

    console.log('\n📧 Sending calendar invite emails...');
    console.log(`   To: ${tutorEmail}, ${tuteeEmail}`);
    console.log(`   Subject: ${emailContent.subject}`);
    console.log(`   Google Meet: ${meetUrl}`);

    // Send email to both participants
    const emailPromises = [tutorEmail, tuteeEmail].map(email => 
      transporter.sendMail({
        from: `"GenConnect" <${process.env.EMAIL_USER || 'genconnect.demo@gmail.com'}>`,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html
      })
    );

    await Promise.all(emailPromises);
    
    console.log('✅ Calendar invite emails sent successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error sending calendar invite emails:', error.message);
    
    // Log email content for testing even if sending fails
    console.log('\n📧 Email content that would have been sent:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${tutorEmail}, ${tuteeEmail}`);
    console.log(`Subject: 📚 ${calendarEvent.summary} - Calendar Invite`);
    console.log(`Google Meet Link: ${meetUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Don't throw error, just log it - we want the session acceptance to succeed
    return false;
  }
}

// Production setup would require:
// 1. Google Cloud Project with Calendar API enabled
// 2. Service Account credentials
// 3. OAuth2 setup for calendar access
// 4. Proper email service configuration

/*
Example production setup:

const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/calendar']
});

const calendar = google.calendar({ version: 'v3', auth });

const event = await calendar.events.insert({
  calendarId: 'primary',
  resource: calendarEvent,
  conferenceDataVersion: 1
});
*/

module.exports = {
  createCalendarEventWithMeet,
  sendCalendarInviteEmails
};
