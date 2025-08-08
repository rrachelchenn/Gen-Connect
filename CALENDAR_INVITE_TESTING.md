# Calendar Invite Testing Setup

## Updated Demo User Emails

The demo user emails have been updated to your real email addresses for testing calendar invites:

### **New Login Credentials:**

#### **Tutee Account (Betty Johnson)**
- **Email**: `rachelchen0211@gmail.com`
- **Password**: `demo123`
- **Role**: Tutee (learner)

#### **Tutor Account (Alex Chen)**  
- **Email**: `rachel_chen@berkeley.edu`
- **Password**: `demo123`
- **Role**: Tutor (instructor)

## Testing Calendar Invites

### **Step-by-Step Test Process:**

1. **Login as Tutee**
   - Go to: https://genconnect.live
   - Email: `rachelchen0211@gmail.com`
   - Password: `demo123`

2. **Book a Session**
   - Go to "Reading Library" or "Browse Tutors"
   - Select "Online Grocery Shopping Basics" or any reading
   - Book a session with Alex Chen
   - You'll see "Session request sent successfully!"

3. **Login as Tutor**
   - Open new browser tab/window
   - Go to: https://genconnect.live  
   - Email: `rachel_chen@berkeley.edu`
   - Password: `demo123`

4. **Accept the Session Request**
   - You'll see the pending request in the dashboard
   - Click "Accept" button
   - **Calendar event will be created** with Google Meet link
   - **Email invites will be logged** to console (or sent if email is configured)

5. **Check Your Email**
   - Look for calendar invites in both email accounts
   - The invites should contain:
     - Session details (topic, date, time, duration)
     - Google Meet link in proper format: `https://meet.google.com/xxx-xxxx-xxx`
     - Professional HTML formatting
     - Direct join button

6. **Test the Session Workspace**
   - Go back to either account
   - Find the scheduled session in dashboard
   - Click "📚 Open Session Workspace"
   - Click "🎥 Join Google Meet" 
   - **Should open working Google Meet room**

## Expected Calendar Invite Content

The calendar invites will include:

```html
📚 GenConnect Session Invitation

Session Details:
📖 Topic: Online Grocery Shopping Basics
📅 Date & Time: [Scheduled time]
⏱️ Duration: 20 minutes

🎥 Join the Session
[Join Google Meet Button]

📝 Session Workspace
- View reading material with proper formatting
- See discussion questions and answers  
- Take collaborative notes during the session
```

## Google Meet Link Format

- **Correct Format**: `https://meet.google.com/abc-defg-hij`
- **Generated From**: Session ID + Reading ID + Date (MD5 hash)
- **Accessible**: Anyone with the link can join
- **No Host Required**: Either participant can join anytime

## Vercel Database Limitations

**Important Note**: Due to Vercel's serverless environment:

- **Local Database**: Email updates work immediately
- **Production Database**: May reset between deployments
- **Fallback**: Demo users are re-seeded with new emails on each deployment

If the demo emails revert to old ones on production, the seeding process will automatically update them with your email addresses on the next session creation.

## Troubleshooting

### **If Calendar Invites Don't Arrive:**
1. Check console logs for the email content (currently logged instead of sent)
2. Verify email addresses are correct in the database
3. Check spam/junk folders

### **If Google Meet Link Doesn't Work:**
1. Verify the link format is `xxx-xxxx-xxx` pattern
2. Try opening in incognito/private browser window
3. Check browser console for any errors

### **If Demo Emails Revert:**
1. The system will automatically re-seed with your emails
2. Or manually run: `node server/database/updateDemoEmails.js`

## Production Email Setup

For actual email sending (not just console logs), you would need:

1. **Email Service Provider** (Gmail, SendGrid, etc.)
2. **SMTP Credentials** in environment variables
3. **Update `googleCalendar.js`** to use real transporter instead of console.log

```javascript
// Example production email setup
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Success Indicators

✅ **Calendar Event Created**: Console shows calendar event details  
✅ **Google Meet Generated**: Link in format `meet.google.com/xxx-xxxx-xxx`  
✅ **Email Invites Logged**: HTML content displayed in console  
✅ **Session Workspace**: Article + Google Meet integration works  
✅ **No Invalid Meeting ID**: Google Meet opens successfully  

You should now be able to test the complete calendar invite and Google Meet integration flow with your real email addresses!
