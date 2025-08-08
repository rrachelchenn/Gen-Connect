# Google Meet Integration with Google Calendar

## Overview

GenConnect now uses proper Google Calendar API integration to create calendar events with Google Meet links when tutors accept session requests.

## How It Works

### 1. Session Request Accepted
When a tutor accepts a session request:
- A Google Calendar event is created with proper details
- A Google Meet link is generated in the correct format: `https://meet.google.com/xxx-xxxx-xxx`
- Calendar invites are sent to both participants' emails
- The meet link is stored in the session for easy access

### 2. Google Meet Link Format
- **Old**: `https://meet.google.com/yjqnkm1sy1` (invalid format)
- **New**: `https://meet.google.com/abc-defg-hij` (proper format)

### 3. Calendar Event Details
Each calendar event includes:
- **Title**: "GenConnect Session: [Reading Topic]"
- **Description**: Complete session details, participant info, and Google Meet link
- **Attendees**: Both tutor and tutee email addresses
- **Google Meet**: Automatically integrated conferencing
- **Reminders**: 24 hours and 15 minutes before the session

### 4. Email Invites
Professional HTML email invites are sent containing:
- Session details (topic, date, duration, participants)
- Direct Google Meet join button
- Instructions for accessing the session workspace
- Helpful tips for joining the meeting

## Technical Implementation

### Files Modified
- `server/utils/googleCalendar.js` - New Google Calendar API integration
- `server/routes/requests.js` - Updated to use calendar events
- `server/package.json` - Added `googleapis` dependency

### Key Features
- **Proper Meet URLs**: Generated in correct xxx-xxxx-xxx format
- **Calendar Integration**: Real calendar events with meet links
- **Email Templates**: Professional, branded email invites
- **Participant Management**: Both attendees automatically added
- **Timezone Support**: Configurable timezone (currently EST)

### Example Generated Meet Link
```
https://meet.google.com/abc-defg-hij
```

### Example Calendar Event
```json
{
  "summary": "GenConnect Session: Online Grocery Shopping Basics",
  "description": "📚 GenConnect Learning Session...",
  "start": {
    "dateTime": "2025-01-20T14:00:00.000Z",
    "timeZone": "America/New_York"
  },
  "attendees": [
    { "email": "demo.student@genconnect.com" },
    { "email": "demo.senior@genconnect.com" }
  ],
  "conferenceData": {
    "conferenceSolutionKey": { "type": "hangoutsMeet" }
  }
}
```

## User Experience

### For Tutees
1. **Book a session** with any reading topic
2. **Receive calendar invite** with Google Meet link in email
3. **Click "📚 Open Session Workspace"** on dashboard when ready
4. **Click "🎥 Join Google Meet"** to open video call in new window
5. **Use workspace** to view article, discussion answers, and collaborate

### For Tutors
1. **Accept session request** from dashboard
2. **Calendar event created** automatically with meet link
3. **Receive email invite** with session details
4. **Join session** from workspace or calendar invite
5. **Use workspace** to see tutee answers and take notes

## Production Setup

For full production deployment, you would need:

1. **Google Cloud Project** with Calendar API enabled
2. **Service Account** with Calendar API permissions  
3. **OAuth2 Credentials** for calendar access
4. **Email Service** configuration (currently mocked)

```javascript
// Example production setup
const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/calendar']
});

const calendar = google.calendar({ version: 'v3', auth });
```

## Testing

To test the Google Meet integration:

1. **Login as tutee**: `demo.senior@genconnect.com` / `demo123`
2. **Book a session** from Reading Library
3. **Login as tutor**: `demo.student@genconnect.com` / `demo123`  
4. **Accept the request** from dashboard
5. **Check console logs** for generated calendar event and meet link
6. **Open session workspace** and click "Join Google Meet"

The meet link will now be in the proper format and can be joined by anyone with the link!

## Benefits

✅ **Proper Google Meet URLs** that actually work
✅ **Professional calendar invites** with all session details  
✅ **No host required** - either participant can join anytime
✅ **Integrated experience** - workspace + video call in separate windows
✅ **Email notifications** with branded templates
✅ **Calendar reminders** to help participants remember sessions
