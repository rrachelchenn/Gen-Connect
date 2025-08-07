import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface SessionData {
  id: number;
  tutee_name: string;
  tutor_name: string;
  reading_title: string;
  session_date: string;
}

const Feedback: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [followUpResources, setFollowUpResources] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await axios.get(`/api/sessions/${sessionId}`);
      setSession(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/feedback', {
        sessionId: parseInt(sessionId!),
        rating,
        comments,
        whatLearned,
        followUpResources
      });
      setSuccess('Feedback submitted successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading session details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!session) return <div className="error-message">Session not found</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1>Session Feedback ✨</h1>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1e40af' }}>{session.reading_title}</h2>
        <p style={{ margin: '0.5rem 0' }}>
          <strong>Session Date:</strong> {new Date(session.session_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <p style={{ margin: '0.5rem 0' }}>
          <strong>Participants:</strong> {session.tutee_name} and {session.tutor_name}
        </p>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <h3>How was your session?</h3>
        
        <div className="form-group">
          <label className="form-label">
            Overall Rating (1-5 stars)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  fontSize: '2rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: star <= rating ? '#fbbf24' : '#d1d5db'
                }}
              >
                ⭐
              </button>
            ))}
            <span style={{ marginLeft: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
              {rating} star{rating !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="whatLearned" className="form-label">
            What did you learn today?
          </label>
          <textarea
            id="whatLearned"
            className="form-textarea"
            value={whatLearned}
            onChange={(e) => setWhatLearned(e.target.value)}
            placeholder="Share what new skills or knowledge you gained from this session..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="comments" className="form-label">
            Additional Comments
          </label>
          <textarea
            id="comments"
            className="form-textarea"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Any other thoughts about the session? How was your tutor/student?"
            rows={4}
          />
        </div>

        {user?.role === 'tutor' && (
          <div className="form-group">
            <label htmlFor="followUpResources" className="form-label">
              Follow-up Resources & Recommendations
            </label>
            <textarea
              id="followUpResources"
              className="form-textarea"
              value={followUpResources}
              onChange={(e) => setFollowUpResources(e.target.value)}
              placeholder="Suggest helpful websites, apps, or next steps for your student..."
              rows={4}
            />
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={submitting}
          style={{ width: '100%' }}
        >
          {submitting ? 'Submitting Feedback...' : 'Submit Feedback'}
        </button>
      </form>

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h3>Thank you for using GenConnect! 🎉</h3>
        <p style={{ marginBottom: '2rem' }}>
          Your feedback helps us improve the learning experience for everyone.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Feedback;