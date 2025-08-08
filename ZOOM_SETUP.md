# Zoom Integration Setup Guide

## Overview

GenConnect now supports real Zoom integration with shared meeting rooms that are not tied to any specific user's account. This allows both tutors and tutees to join sessions without needing their own Zoom accounts.

## Setup Options

### Option 1: Real Zoom API (Recommended)

This creates actual Zoom meetings using Zoom's API. You'll need a Zoom Developer account.

#### Step 1: Create Zoom Developer Account
1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Sign in with your Zoom account
3. Click "Develop" → "Build App"
4. Choose "JWT App" (simplest option)
5. Fill in the app information:
   - App name: "GenConnect"
   - App type: "Meeting"
   - User type: "Account"
6. Complete the app creation

#### Step 2: Get API Credentials
1. In your app dashboard, go to "App Credentials"
2. Copy the following:
   - API Key
   - API Secret
   - Account ID (from the "Account" tab)

#### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Zoom API Configuration
ZOOM_API_KEY=your-zoom-api-key
ZOOM_API_SECRET=your-zoom-api-secret
ZOOM_ACCOUNT_ID=your-zoom-account-id

# Optional: Use permanent meeting rooms
USE_PERMANENT_MEETINGS=false
```

### Option 2: Zoom Web SDK (No API Key Required)

This uses Zoom's Web SDK to create meetings that anyone can join via browser.

#### How it works:
- Creates meeting URLs like: `https://zoom.us/wc/join/MEETING_ID?pwd=PASSWORD`
- Anyone can join without a Zoom account
- Works in any browser
- No API credentials needed

#### Setup:
No setup required! The system will automatically fall back to this method if no API credentials are provided.

## Meeting Types

### 1. Scheduled Meetings (Default)
- Created for each specific session
- Have a start time and duration
- Automatically expire after the session
- Good for one-time sessions

### 2. Permanent Meeting Rooms
- Reusable meeting rooms
- Same meeting ID for all sessions
- Never expire
- Good for recurring sessions

To enable permanent rooms, set:
```env
USE_PERMANENT_MEETINGS=true
```

## Features

### ✅ Shared Meeting Rooms
- Meetings are not tied to any user's account
- Both participants can join without Zoom accounts
- Works with Zoom Web SDK (browser-based)

### ✅ Automatic Meeting Creation
- Meetings are created when tutors accept session requests
- Email notifications sent to both participants
- Meeting details stored in the database

### ✅ Role-Based Access
- **Tutors**: Get "Start Meeting" button (host privileges)
- **Tutees**: Get "Join Meeting" button (participant access)

### ✅ Demo Mode
- 15-minute rule disabled for testing
- Can join sessions immediately
- Perfect for development and testing

## Testing the Integration

### 1. Without API Credentials (Web SDK)
```bash
# Start the server
npm start

# The system will automatically use Web SDK fallback
# No additional setup needed
```

### 2. With API Credentials (Real Zoom)
```bash
# Set up your .env file with Zoom credentials
cp env.example .env
# Edit .env with your Zoom API details

# Start the server
npm start

# The system will create real Zoom meetings
```

### 3. Test the Flow
1. Login as tutee and book a session
2. Login as tutor and accept the request
3. Check the server logs for meeting creation
4. Click "Join Session" to test the Zoom integration

## Troubleshooting

### "Failed to create Zoom meeting"
- Check your API credentials in `.env`
- Verify your Zoom app has the correct permissions
- The system will fall back to Web SDK if API fails

### "Meeting not found"
- Ensure the meeting was created successfully
- Check the database for meeting details
- Verify the meeting ID and password

### Email Notifications
- Currently logged to console (see server logs)
- To enable real email sending, configure SMTP settings in `.env`

## Security Considerations

### API Credentials
- Keep your Zoom API credentials secure
- Never commit `.env` files to version control
- Use environment variables in production

### Meeting Security
- All meetings have passwords enabled
- Passwords are randomly generated
- Meeting IDs are unique for each session

## Production Deployment

### Environment Variables
```env
# Required for real Zoom meetings
ZOOM_API_KEY=your-production-api-key
ZOOM_API_SECRET=your-production-api-secret
ZOOM_ACCOUNT_ID=your-production-account-id

# Email configuration for notifications
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
```

### Scaling Considerations
- Zoom API has rate limits (100 requests per day for free tier)
- Consider using permanent meeting rooms for high-volume usage
- Monitor API usage in your Zoom Developer dashboard

## Support

For issues with:
- **Zoom API**: Check [Zoom Developer Documentation](https://marketplace.zoom.us/docs/api-reference/zoom-api)
- **GenConnect Integration**: Check server logs for error messages
- **Web SDK**: Verify meeting URLs are accessible
