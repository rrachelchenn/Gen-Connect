import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface SessionRequest {
  id: number;
  tutee_name: string;
  tech_comfort_level: string;
  reading_title: string;
  reading_summary: string;
  session_date: string;
  duration_minutes: number;
  created_at: string;
  expires_at: string;
}

interface RequestStats {
  pending_count: number;
  scheduled_count: number;
  completed_count: number;
}

const SessionRequests: React.FC = () => {
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/requests/pending`);
      setRequests(response.data);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      // Don't show error if it's just no requests
      if (err.response?.status === 404 || err.response?.status === 403) {
        setRequests([]);
      } else {
        setError('Failed to load pending requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/requests/stats`);
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      // Set default stats if there's an error
      setStats({
        pending_count: 0,
        scheduled_count: 0,
        completed_count: 0
      });
    }
  };

  const handleAccept = async (requestId: number) => {
    setProcessingRequest(requestId);
    try {
      await axios.post(`${API_BASE_URL}/requests/${requestId}/accept`);
      setRequests(requests.filter(req => req.id !== requestId));
      fetchStats(); // Refresh stats
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDecline = async (requestId: number) => {
    setProcessingRequest(requestId);
    try {
      await axios.post(`${API_BASE_URL}/requests/${requestId}/decline`);
      setRequests(requests.filter(req => req.id !== requestId));
      fetchStats(); // Refresh stats
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to decline request');
    } finally {
      setProcessingRequest(null);
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

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const getTimeRemainingColor = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return '#ef4444'; // Red for expired
    if (diff < 1000 * 60 * 60) return '#f59e0b'; // Orange for less than 1 hour
    return '#10b981'; // Green for more than 1 hour
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Loading requests...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Request Statistics */}
      {stats && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Session Requests Overview</h2>
          <div className="grid grid-3">
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {stats.pending_count}
              </div>
              <div style={{ color: '#6b7280' }}>Pending</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {stats.scheduled_count}
              </div>
              <div style={{ color: '#6b7280' }}>Scheduled</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {stats.completed_count}
              </div>
              <div style={{ color: '#6b7280' }}>Completed</div>
            </div>

          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Pending Session Requests</h2>
          <button 
            onClick={fetchRequests}
            className="btn btn-outline"
            style={{ fontSize: '0.9rem' }}
          >
            🔄 Refresh
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3>No pending requests</h3>
            <p style={{ color: '#6b7280' }}>
              You have no session requests waiting for your response.
            </p>
          </div>
        ) : (
          <div className="grid">
            {requests.map((request) => (
              <div 
                key={request.id} 
                className="card" 
                style={{ 
                  margin: 0,
                  borderLeft: '4px solid #f59e0b',
                  position: 'relative'
                }}
              >
                {/* Time remaining indicator */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: getTimeRemainingColor(request.expires_at),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  {getTimeRemaining(request.expires_at)}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                    {request.reading_title}
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>
                    {request.reading_summary}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0.25rem 0', fontSize: '1rem' }}>
                    <strong>👤 Student:</strong> {request.tutee_name}
                    {request.tech_comfort_level && (
                      <span style={{ 
                        marginLeft: '0.5rem',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '10px',
                        fontSize: '0.8rem'
                      }}>
                        {request.tech_comfort_level}
                      </span>
                    )}
                  </p>
                  <p style={{ margin: '0.25rem 0', fontSize: '1rem' }}>
                    <strong>📅 Session Time:</strong> {formatDate(request.session_date)}
                  </p>
                  <p style={{ margin: '0.25rem 0', fontSize: '1rem' }}>
                    <strong>⏱️ Duration:</strong> {request.duration_minutes} minutes
                  </p>
                  <p style={{ margin: '0.25rem 0', fontSize: '1rem' }}>
                    <strong>📨 Requested:</strong> {formatDate(request.created_at)}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleAccept(request.id)}
                    disabled={processingRequest === request.id}
                    className="btn btn-primary"
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    {processingRequest === request.id ? 'Accepting...' : '✅ Accept'}
                  </button>
                  
                  <button
                    onClick={() => handleDecline(request.id)}
                    disabled={processingRequest === request.id}
                    className="btn btn-secondary"
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    {processingRequest === request.id ? 'Declining...' : '❌ Decline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionRequests;
