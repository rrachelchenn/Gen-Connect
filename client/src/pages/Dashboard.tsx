import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import SessionRequests from '../components/SessionRequests';
import SessionWorkspace from '../components/SessionWorkspace';

interface Session {
  id: number;
  reading_id: number;
  session_date: string;
  status: string;
  reading_title: string;
  reading_summary: string;
  duration_minutes: number;
  tutor_name?: string;
  tutor_college?: string;
  tutee_name?: string;
  tutee_tech_comfort_level?: string;
  zoom_meeting_id?: string;
  zoom_join_url?: string;
  zoom_start_url?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/my-sessions`);
      setSessions(response.data);
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
      // Don't show error if it's just no sessions
      if (err.response?.status === 404 || err.response?.status === 403) {
        setSessions([]);
      } else {
        setError('Failed to load sessions');
      }
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!user) return null;

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <h1>Welcome back, {user.name}! 👋</h1>
        <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
          {user.role === 'tutee' 
            ? 'Ready to learn something new today?' 
            : 'Ready to help someone learn today?'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Quick Actions</h2>
        <div className="grid grid-3">
          <Link to="/readings" className="btn btn-primary" style={{ textAlign: 'center' }}>
            📚 Browse Reading Library
          </Link>
          
          {user.role === 'tutee' && (
            <Link to="/readings" className="btn btn-outline" style={{ textAlign: 'center' }}>
              📅 Book a Session
            </Link>
          )}
          
          {user.role === 'tutor' && (
            <Link to="/profile" className="btn btn-outline" style={{ textAlign: 'center' }}>
              ⏰ Set Availability
            </Link>
          )}
          
          <Link to="/profile" className="btn btn-secondary" style={{ textAlign: 'center' }}>
            👤 Update Profile
          </Link>
        </div>
      </div>

      {/* Session Requests Section for Tutors */}
      {user.role === 'tutor' && (
        <SessionRequests />
      )}

      {/* Video Chat Modal */}
      {selectedSession && (
        <SessionWorkspace
          session={sessions.find(s => s.id === selectedSession)!}
          userRole={user.role}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* Sessions Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>
            {user.role === 'tutee' ? 'My Learning Sessions' : 'My Tutoring Sessions'}
          </h2>
        </div>

        {loading ? (
          <div className="loading">Loading your sessions...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3>No sessions yet</h3>
            <p style={{ marginBottom: '2rem' }}>
              {user.role === 'tutee' 
                ? 'Start by browsing our reading library and booking your first session!'
                : 'Sessions will appear here when students book with you.'}
            </p>
            {user.role === 'tutee' && (
              <Link to="/readings" className="btn btn-primary">
                Browse Readings
              </Link>
            )}
          </div>
        ) : (
          <div className="grid">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className="card" 
                style={{ 
                  margin: 0,
                  borderLeft: `4px solid ${getStatusColor(session.status)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                    {session.reading_title}
                  </h3>
                  <span 
                    style={{ 
                      backgroundColor: getStatusColor(session.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}
                  >
                    {session.status}
                  </span>
                </div>

                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  {session.reading_summary}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0.25rem 0', fontSize: '1rem' }}>
                    <strong>📅 Session Time:</strong> {formatDate(session.session_date)}
                  </p>
                  
                  {user.role === 'tutee' && session.tutor_name && (
                    <p style={{ margin: '0.25rem 0', fontSize: '1rem' }}>
                      <strong>👩‍🎓 Tutor:</strong> {session.tutor_name}
                      {session.tutor_college && ` (${session.tutor_college})`}
                    </p>
                  )}
                  
                  {user.role === 'tutor' && session.tutee_name && (
                    <p style={{ margin: '0.25rem 0', fontSize: '1rem' }}>
                      <strong>🧓 Student:</strong> {session.tutee_name}
                      {session.tutee_tech_comfort_level && (
                        <span style={{ 
                          marginLeft: '0.5rem',
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '10px',
                          fontSize: '0.8rem'
                        }}>
                          {session.tutee_tech_comfort_level}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {session.status === 'scheduled' && (
                    <button 
                      onClick={() => setSelectedSession(session.id)}
                      className="btn btn-primary"
                    >
                      Join Session
                    </button>
                  )}
                  
                  {session.status === 'completed' && (
                    <Link 
                      to={`/feedback/${session.id}`}
                      className="btn btn-outline"
                    >
                      View Feedback
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;