import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface ContactRequest {
  id: number;
  tutor_id: number;
  name: string;
  email: string;
  phone: string;
  preferred_topics: string;
  message: string;
  status: string;
  created_at: string;
}

const ContactRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'scheduled'>('pending');

  useEffect(() => {
    if (user) {
      fetchContactRequests();
    }
  }, [user]);

  const fetchContactRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tutors/${user?.id}/contact-requests`);
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching contact requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: number, newStatus: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/tutors/contact-requests/${requestId}`, {
        status: newStatus
      });
      // Update local state
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  const pendingCount = requests.filter(req => req.status === 'pending').length;

  if (loading) {
    return (
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Contact Requests</h2>
        <p>Loading requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Contact Requests</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
          <p style={{ color: '#6b7280' }}>
            No contact requests yet. When seniors fill out your contact form, they'll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>
          Contact Requests
          {pendingCount > 0 && (
            <span style={{
              marginLeft: '0.75rem',
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {pendingCount} new
            </span>
          )}
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('contacted')}
            className={`btn ${filter === 'contacted' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            Contacted
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`btn ${filter === 'scheduled' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            Scheduled
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#6b7280' }}>No requests with status: {filter}</p>
        </div>
      ) : (
        <div className="grid">
          {filteredRequests.map(request => (
            <div 
              key={request.id} 
              className="card"
              style={{ 
                margin: 0,
                borderLeft: `4px solid ${
                  request.status === 'pending' ? '#ef4444' :
                  request.status === 'contacted' ? '#f59e0b' :
                  request.status === 'scheduled' ? '#10b981' : '#6b7280'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>{request.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                    {formatDate(request.created_at)}
                  </p>
                </div>
                <span 
                  style={{ 
                    backgroundColor: 
                      request.status === 'pending' ? '#ef4444' :
                      request.status === 'contacted' ? '#f59e0b' :
                      request.status === 'scheduled' ? '#10b981' : '#6b7280',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '15px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}
                >
                  {request.status}
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>📧 Email:</strong> <a href={`mailto:${request.email}`}>{request.email}</a>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>📞 Phone:</strong> <a href={`tel:${request.phone}`}>{request.phone}</a>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>🎯 Interested in:</strong> {request.preferred_topics}
                </p>
                {request.message && (
                  <p style={{ margin: '0.5rem 0', marginTop: '1rem' }}>
                    <strong>Message:</strong><br />
                    <span style={{ color: '#6b7280' }}>{request.message}</span>
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {request.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(request.id, 'contacted')}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Mark as Contacted
                  </button>
                )}
                {request.status === 'contacted' && (
                  <button
                    onClick={() => updateStatus(request.id, 'scheduled')}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Mark as Scheduled
                  </button>
                )}
                {request.status === 'scheduled' && (
                  <button
                    onClick={() => updateStatus(request.id, 'completed')}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactRequests;

