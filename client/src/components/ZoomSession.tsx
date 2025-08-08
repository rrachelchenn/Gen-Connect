import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Session {
  id: number;
  session_date: string;
  duration_minutes: number;
  status: string;
  zoom_meeting_id?: string;
  zoom_join_url?: string;
  zoom_start_url?: string;
  tutee_name: string;
  tutor_name: string;
  reading_title: string;
}

interface ZoomSessionProps {
  sessionId: number;
  userRole: 'tutee' | 'tutor';
}

const ZoomSession: React.FC<ZoomSessionProps> = ({ sessionId, userRole }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [canJoin, setCanJoin] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessionDetails();
    const interval = setInterval(updateTimeStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      const response = await axios.get(`/api/zoom/session/${sessionId}`);
      setSession(response.data.session);
      setCanJoin(response.data.canJoin);
      setTimeUntilStart(response.data.timeUntilStart);
    } catch (err: any) {
      setError('Failed to load session details');
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeStatus = () => {
    if (session) {
      // For demo purposes, always allow joining
      setCanJoin(true);
      
      const now = new Date();
      const sessionTime = new Date(session.session_date);
      const diff = sessionTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeUntilStart('Session has started');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          setTimeUntilStart(`${hours}h ${minutes}m until session starts`);
        } else {
          setTimeUntilStart(`${minutes}m until session starts`);
        }
      }
    }
  };

  const handleJoinSession = () => {
    if (!session) return;
    
    const joinUrl = userRole === 'tutor' ? session.zoom_start_url : session.zoom_join_url;
    if (joinUrl) {
      window.open(joinUrl, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Loading session details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card">
        <div className="error-message">Session not found</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>Zoom Session</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#1e40af', marginBottom: '1rem' }}>
          {session.reading_title}
        </h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
            <strong>📅 Session Time:</strong> {formatDate(session.session_date)}
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
            <strong>⏱️ Duration:</strong> {session.duration_minutes} minutes
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
            <strong>👤 {userRole === 'tutor' ? 'Student' : 'Tutor'}:</strong> 
            {userRole === 'tutor' ? session.tutee_name : session.tutor_name}
          </p>
        </div>

        {session.zoom_meeting_id && (
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>
              <strong>🔗 Meeting ID:</strong> {session.zoom_meeting_id}
            </p>
            {session.zoom_join_url && (
              <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>
                <strong>📎 Join URL:</strong> 
                <a href={session.zoom_join_url} target="_blank" rel="noopener noreferrer" 
                   style={{ marginLeft: '0.5rem', color: '#3b82f6' }}>
                  {session.zoom_join_url}
                </a>
              </p>
            )}
          </div>
        )}
      </div>

      <div style={{ 
        backgroundColor: canJoin ? '#f0fdf4' : '#fef3c7', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        border: `2px solid ${canJoin ? '#10b981' : '#f59e0b'}`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {canJoin ? '✅' : '⏰'}
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: canJoin ? '#059669' : '#d97706' }}>
            {canJoin ? 'Ready to Join! (Demo Mode)' : 'Session Not Yet Available'}
          </h3>
          <p style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>
            {canJoin 
              ? 'You can now join your Zoom session. Click the button below to open Zoom.'
              : 'Demo mode: You can join this session anytime.'
            }
          </p>
          <p style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '1.1rem', 
            fontWeight: '600',
            color: canJoin ? '#059669' : '#d97706'
          }}>
            {timeUntilStart}
          </p>
          
          {canJoin && session.zoom_meeting_id && (
            <button
              onClick={handleJoinSession}
              className="btn btn-primary btn-large"
              style={{ 
                fontSize: '1.2rem', 
                padding: '1rem 2rem',
                backgroundColor: '#10b981',
                borderColor: '#10b981'
              }}
            >
              🎥 {userRole === 'tutor' ? 'Start Zoom Meeting' : 'Join Zoom Meeting'}
            </button>
          )}
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '1rem', 
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Session Guidelines:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280' }}>
          <li><strong>Demo Mode:</strong> Join anytime for testing</li>
          <li>Test your audio and video before the session begins</li>
          <li>Have the reading material ready for discussion</li>
          <li>Be patient and respectful during the session</li>
        </ul>
      </div>
    </div>
  );
};

export default ZoomSession;
