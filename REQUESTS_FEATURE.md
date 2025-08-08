# Session Requests Feature

## Overview
This feature implements a session request system where tutees can send session requests to tutors, and tutors have 24 hours to accept or decline these requests.

## Key Changes Made

### 1. Database Schema Updates
- Modified `sessions` table to include:
  - `status` field now supports 'pending', 'scheduled', 'active', 'completed', 'cancelled', 'declined'
  - `request_expires_at` field to track when requests expire (24 hours from creation)

### 2. Backend API Changes

#### New Routes (`/api/requests`)
- `GET /api/requests/pending` - Get pending requests for a tutor
- `POST /api/requests/:id/accept` - Accept a session request
- `POST /api/requests/:id/decline` - Decline a session request
- `GET /api/requests/stats` - Get request statistics for tutor dashboard

#### Modified Routes
- `POST /api/sessions/book` - Now creates requests instead of direct bookings
- `GET /api/sessions/my-sessions` - Filters out pending requests from main sessions list

### 3. Frontend Components

#### New Component: `SessionRequests.tsx`
- Displays pending session requests for tutors
- Shows request statistics (pending, scheduled, completed, declined counts)
- Allows tutors to accept or decline requests
- Shows time remaining for each request (24-hour countdown)
- Color-coded time indicators (green > 1 hour, orange < 1 hour, red expired)

#### Updated Components
- `Dashboard.tsx` - Now includes SessionRequests component for tutors
- `BookSession.tsx` - Updated success message to indicate request was sent

### 4. User Experience Flow

#### For Tutees:
1. Browse reading library
2. Select a tutor and time slot
3. Submit session request
4. Receive confirmation that request was sent
5. Wait for tutor response (up to 24 hours)

#### For Tutors:
1. See pending requests in dashboard
2. View request details (student info, reading, time, duration)
3. See time remaining for each request
4. Accept or decline requests
5. View request statistics

## Features

### Request Management
- **24-hour expiration**: Requests automatically expire after 24 hours
- **Time tracking**: Visual countdown showing time remaining
- **Status tracking**: Clear status indicators (pending, accepted, declined, expired)
- **Statistics**: Overview of all request types for tutors

### User Interface
- **Responsive design**: Works on desktop and mobile
- **Accessibility**: High contrast support and focus indicators
- **Visual feedback**: Color-coded time indicators and status badges
- **Real-time updates**: Refresh functionality and immediate status changes

### Security
- **Authentication required**: All request operations require valid user authentication
- **Authorization checks**: Only tutors can view/respond to requests
- **Data validation**: Proper validation of request data and expiration times

## Testing the Feature

### Prerequisites
1. Install Node.js (v16 or higher)
2. Run `./setup.sh` to install dependencies
3. Start the application with `npm start`

### Test Scenarios

#### 1. Create a Session Request
1. Login as a tutee (demo.senior@genconnect.com / demo123)
2. Browse readings and select one
3. Choose a tutor and time slot
4. Submit the request
5. Verify success message indicates request was sent

#### 2. Respond to Session Request
1. Login as a tutor (demo.student@genconnect.com / demo123)
2. Check dashboard for pending requests section
3. View request details and time remaining
4. Accept or decline the request
5. Verify request disappears from pending list
6. Check statistics update

#### 3. Request Expiration
1. Create a request
2. Wait for expiration (or modify database for testing)
3. Verify expired requests are not shown to tutors
4. Verify expired requests cannot be accepted/declined

## Database Migration
If you have existing data, you may need to update existing sessions:
```sql
UPDATE sessions SET status = 'scheduled' WHERE status IS NULL OR status = '';
```

## Future Enhancements
- Email notifications for new requests and expiring requests
- Push notifications for mobile users
- Request history and analytics
- Bulk accept/decline functionality
- Custom expiration times per tutor
