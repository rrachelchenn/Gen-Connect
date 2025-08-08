import React, { useState, useEffect, useRef } from 'react';
import './ZoomWebSDK.css';

interface ZoomWebSDKProps {
  session: {
    id: string;
    session_date: string;
    duration_minutes: number;
    tutee_name: string;
    tutor_name: string;
    reading_title: string;
    zoom_meeting_id?: string;
    zoom_join_url?: string;
    zoom_start_url?: string;
  };
  userRole: 'tutor' | 'tutee';
  onClose: () => void;
}

declare global {
  interface Window {
    ZoomMtg: any;
  }
}

const ZoomWebSDK: React.FC<ZoomWebSDKProps> = ({ session, userRole, onClose }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Zoom Web SDK
    if (window.ZoomMtg) {
      window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
      window.ZoomMtg.preLoadWasm();
      window.ZoomMtg.prepareWebSDK();
      
      // Set language
      window.ZoomMtg.i18n.load('en-US');
      window.ZoomMtg.i18n.reload('en-US');
    }
  }, []);

  const generateMeetingSignature = (meetingNumber: string, role: number): string => {
    // For demo purposes, we'll create a simple signature
    // In production, this should be generated on the server side
    const timestamp = Math.round(new Date().getTime() / 1000);
    const msg = Buffer.from(meetingNumber + timestamp + role).toString('base64');
    return msg;
  };

  const startMeeting = async () => {
    try {
      setIsJoining(true);
      setError(null);

      // Generate a unique meeting number for this session
      const meetingNumber = session.zoom_meeting_id || Math.floor(Math.random() * 900000000) + 100000000;
      const password = Math.random().toString(36).substring(2, 8);
      const userName = userRole === 'tutor' ? session.tutor_name : session.tutee_name;
      const userEmail = userRole === 'tutor' ? 'tutor@genconnect.com' : 'tutee@genconnect.com';
      const role = userRole === 'tutor' ? 1 : 0; // 1 for host, 0 for attendee

      // Generate signature (in production, this should come from your server)
      const signature = generateMeetingSignature(meetingNumber.toString(), role);

      // Configure Zoom meeting
      window.ZoomMtg.init({
        leaveUrl: window.location.origin + '/dashboard',
        success: () => {
          console.log('Zoom SDK initialized successfully');
          
          // Join the meeting
          window.ZoomMtg.join({
            signature: signature,
            meetingNumber: meetingNumber,
            userName: userName,
            apiKey: 'your-zoom-sdk-key', // This can be a demo key for testing
            passWord: password,
            role: role,
            success: (success: any) => {
              console.log('Meeting joined successfully:', success);
              setMeetingStarted(true);
              setIsJoining(false);
            },
            error: (error: any) => {
              console.error('Failed to join meeting:', error);
              setError('Failed to join meeting. Please try again.');
              setIsJoining(false);
            }
          });
        },
        error: (error: any) => {
          console.error('Failed to initialize Zoom SDK:', error);
          setError('Failed to initialize Zoom. Please refresh and try again.');
          setIsJoining(false);
        }
      });

    } catch (err) {
      console.error('Error starting meeting:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsJoining(false);
    }
  };

  const joinMeeting = async () => {
    try {
      setIsJoining(true);
      setError(null);

      // For demo purposes, we'll create a simple meeting
      const meetingNumber = session.zoom_meeting_id || Math.floor(Math.random() * 900000000) + 100000000;
      const password = Math.random().toString(36).substring(2, 8);
      const userName = userRole === 'tutor' ? session.tutor_name : session.tutee_name;
      const role = userRole === 'tutor' ? 1 : 0;

      // Generate signature
      const signature = generateMeetingSignature(meetingNumber.toString(), role);

      // Configure Zoom meeting
      window.ZoomMtg.init({
        leaveUrl: window.location.origin + '/dashboard',
        success: () => {
          console.log('Zoom SDK initialized successfully');
          
          // Join the meeting
          window.ZoomMtg.join({
            signature: signature,
            meetingNumber: meetingNumber,
            userName: userName,
            apiKey: 'your-zoom-sdk-key',
            passWord: password,
            role: role,
            success: (success: any) => {
              console.log('Meeting joined successfully:', success);
              setMeetingStarted(true);
              setIsJoining(false);
            },
            error: (error: any) => {
              console.error('Failed to join meeting:', error);
              setError('Failed to join meeting. Please try again.');
              setIsJoining(false);
            }
          });
        },
        error: (error: any) => {
          console.error('Failed to initialize Zoom SDK:', error);
          setError('Failed to initialize Zoom. Please refresh and try again.');
          setIsJoining(false);
        }
      });

    } catch (err) {
      console.error('Error joining meeting:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsJoining(false);
    }
  };

  const leaveMeeting = () => {
    if (window.ZoomMtg) {
      window.ZoomMtg.leaveMeeting({});
    }
    setMeetingStarted(false);
    onClose();
  };

  if (meetingStarted) {
    return (
      <div className="zoom-sdk-container">
        <div className="zoom-sdk-header">
          <h3>GenConnect Session in Progress</h3>
          <button onClick={leaveMeeting} className="leave-btn">
            Leave Meeting
          </button>
        </div>
        <div ref={meetingContainerRef} className="zoom-sdk-meeting" />
      </div>
    );
  }

  return (
    <div className="zoom-sdk-modal">
      <div className="zoom-sdk-content">
        <div className="zoom-sdk-header">
          <h2>Join GenConnect Session</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="session-details">
          <h3>{session.reading_title}</h3>
          <p><strong>Date:</strong> {new Date(session.session_date).toLocaleString()}</p>
          <p><strong>Duration:</strong> {session.duration_minutes} minutes</p>
          <p><strong>Participants:</strong> {session.tutor_name} & {session.tutee_name}</p>
          <p><strong>Your Role:</strong> {userRole === 'tutor' ? 'Tutor (Host)' : 'Student (Participant)'}</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="zoom-sdk-actions">
          {userRole === 'tutor' ? (
            <button 
              onClick={startMeeting} 
              disabled={isJoining}
              className="start-meeting-btn"
            >
              {isJoining ? 'Starting Meeting...' : 'Start Meeting (Host)'}
            </button>
          ) : (
            <button 
              onClick={joinMeeting} 
              disabled={isJoining}
              className="join-meeting-btn"
            >
              {isJoining ? 'Joining Meeting...' : 'Join Meeting'}
            </button>
          )}
          
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </div>

        <div className="zoom-sdk-info">
          <p><strong>Demo Mode:</strong> This creates a browser-based Zoom meeting that anyone can join.</p>
          <p>No Zoom account required - works directly in your browser!</p>
        </div>
      </div>
    </div>
  );
};

export default ZoomWebSDK;
