import React, { useState, useEffect } from 'react';
import './VideoChat.css';

interface VideoChatProps {
  session: {
    id: number;
    session_date: string;
    duration_minutes: number;
    tutee_name?: string;
    tutor_name?: string;
    reading_title: string;
  };
  userRole: 'tutor' | 'tutee';
  onClose: () => void;
}

const VideoChat: React.FC<VideoChatProps> = ({ session, userRole, onClose }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (meetingStarted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [meetingStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startMeeting = async () => {
    setIsJoining(true);
    // Simulate loading time
    setTimeout(() => {
      setMeetingStarted(true);
      setIsJoining(false);
    }, 2000);
  };

  const joinMeeting = async () => {
    setIsJoining(true);
    // Simulate loading time
    setTimeout(() => {
      setMeetingStarted(true);
      setIsJoining(false);
    }, 2000);
  };

  const leaveMeeting = () => {
    setMeetingStarted(false);
    setTimeElapsed(0);
    onClose();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (meetingStarted) {
    return (
      <div className="video-chat-container">
        <div className="video-chat-header">
          <div className="meeting-info">
            <h3>GenConnect Session</h3>
            <p>{session.reading_title}</p>
            <span className="timer">{formatTime(timeElapsed)}</span>
          </div>
          <div className="meeting-controls">
            <button 
              onClick={toggleRecording} 
              className={`control-btn ${isRecording ? 'recording' : ''}`}
            >
              {isRecording ? '⏹️ Stop Recording' : '🔴 Start Recording'}
            </button>
            <button onClick={leaveMeeting} className="control-btn leave">
              Leave Meeting
            </button>
          </div>
        </div>

        <div className="video-grid">
          <div className="video-participant main">
            <div className="video-placeholder">
              <div className="participant-info">
                <h4>{userRole === 'tutor' ? (session.tutor_name || 'Tutor') : (session.tutee_name || 'Student')}</h4>
                <p>{userRole === 'tutor' ? 'Tutor (Host)' : 'Student'}</p>
              </div>
              <div className="video-overlay">
                <span>🎥 Camera Off</span>
              </div>
            </div>
          </div>
          
          <div className="video-participant">
            <div className="video-placeholder">
              <div className="participant-info">
                <h4>{userRole === 'tutor' ? (session.tutee_name || 'Student') : (session.tutor_name || 'Tutor')}</h4>
                <p>{userRole === 'tutor' ? 'Student' : 'Tutor (Host)'}</p>
              </div>
              <div className="video-overlay">
                <span>🎥 Camera Off</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chat-sidebar">
          <div className="chat-header">
            <h4>Session Chat</h4>
          </div>
          <div className="chat-messages">
            <div className="message system">
              <p>Welcome to your GenConnect session! 🎉</p>
              <small>Session started at {new Date().toLocaleTimeString()}</small>
            </div>
            <div className="message">
              <strong>{userRole === 'tutor' ? (session.tutor_name || 'Tutor') : (session.tutee_name || 'Student')}:</strong>
              <p>Hello! Ready to start our session on "{session.reading_title}"?</p>
            </div>
            <div className="message">
              <strong>{userRole === 'tutor' ? (session.tutee_name || 'Student') : (session.tutor_name || 'Tutor')}:</strong>
              <p>Yes, I'm excited to learn! 😊</p>
            </div>
          </div>
          <div className="chat-input">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="message-input"
            />
            <button className="send-btn">Send</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-chat-modal">
      <div className="video-chat-content">
        <div className="video-chat-header">
          <h2>Join GenConnect Session</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="session-details">
          <h3>{session.reading_title}</h3>
          <p><strong>Date:</strong> {new Date(session.session_date).toLocaleString()}</p>
          <p><strong>Duration:</strong> {session.duration_minutes} minutes</p>
          <p><strong>Participants:</strong> {session.tutor_name || 'Tutor'} & {session.tutee_name || 'Student'}</p>
          <p><strong>Your Role:</strong> {userRole === 'tutor' ? 'Tutor (Host)' : 'Student (Participant)'}</p>
        </div>

        <div className="video-chat-actions">
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

        <div className="video-chat-info">
          <p><strong>Demo Mode:</strong> This is a simulated video chat interface.</p>
          <p>In a real implementation, this would connect to Zoom, Google Meet, or another video platform.</p>
          <div className="features-list">
            <h4>Features included:</h4>
            <ul>
              <li>✅ Video chat interface</li>
              <li>✅ Session timer</li>
              <li>✅ Chat functionality</li>
              <li>✅ Recording controls</li>
              <li>✅ Participant management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
