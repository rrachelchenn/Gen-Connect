import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Reading {
  id: number;
  title: string;
  summary: string;
  difficulty_level: string;
}

interface Tutor {
  id: number;
  name: string;
  college: string;
  major: string;
  bio: string;
}

const BookSession: React.FC = () => {
  const { readingId } = useParams<{ readingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [reading, setReading] = useState<Reading | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [sessionDate, setSessionDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (readingId) {
      fetchReading();
      fetchTutors();
    }
  }, [readingId]);

  const fetchReading = async () => {
    try {
      const response = await axios.get(`/api/readings/${readingId}`);
      setReading(response.data);
    } catch (err) {
      setError('Failed to load reading details');
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await axios.get('/api/users/tutors');
      setTutors(response.data);
    } catch (err) {
      setError('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor || !sessionDate) {
      setError('Please select a tutor and session date');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/sessions/book', {
        tutorId: selectedTutor,
        readingId: parseInt(readingId!),
        sessionDate: new Date(sessionDate).toISOString()
      });
      setSuccess('Session booked successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book session');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'tutee') {
    return (
      <div className="card">
        <h2>Access Denied</h2>
        <p>Only tutees can book sessions.</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Book a Session 📅</h1>
      
      {reading && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1e40af' }}>{reading.title}</h2>
          <p>{reading.summary}</p>
          <span className={`difficulty-badge difficulty-${reading.difficulty_level}`}>
            {reading.difficulty_level}
          </span>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="card">
        <h3>Select a Tutor</h3>
        <div className="grid" style={{ marginBottom: '2rem' }}>
          {tutors.map(tutor => (
            <label 
              key={tutor.id} 
              style={{
                display: 'block',
                padding: '1rem',
                border: `2px solid ${selectedTutor === tutor.id ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedTutor === tutor.id ? '#eff6ff' : 'white'
              }}
            >
              <input
                type="radio"
                name="tutor"
                value={tutor.id}
                checked={selectedTutor === tutor.id}
                onChange={() => setSelectedTutor(tutor.id)}
                style={{ marginRight: '0.5rem' }}
              />
              <strong>{tutor.name}</strong> - {tutor.college}
              <br />
              <small style={{ color: '#6b7280' }}>{tutor.major}</small>
            </label>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="sessionDate" className="form-label">
            Preferred Session Date & Time
          </label>
          <input
            type="datetime-local"
            id="sessionDate"
            className="form-input"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={submitting}
          style={{ width: '100%' }}
        >
          {submitting ? 'Booking Session...' : 'Book Session'}
        </button>
      </form>
    </div>
  );
};

export default BookSession;