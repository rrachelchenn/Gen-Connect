import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

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

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  topics: string;
}

const BookSession: React.FC = () => {
  const { readingId } = useParams<{ readingId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const tutorIdParam = searchParams.get('tutor');
  
  const [reading, setReading] = useState<Reading | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(20);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (readingId) {
      fetchReading();
    }
    fetchTutors(); // Always fetch tutors, even without a reading
  }, [readingId]);

  // Pre-select tutor if provided in URL
  useEffect(() => {
    if (tutorIdParam && tutors.length > 0) {
      const tutorId = parseInt(tutorIdParam);
      if (tutors.find(t => t.id === tutorId)) {
        setSelectedTutor(tutorId);
      }
    }
  }, [tutorIdParam, tutors]);

  useEffect(() => {
    if (selectedTutor && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedTutor, selectedDate, selectedDuration]);

  const fetchReading = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/readings/${readingId}`);
      setReading(response.data);
    } catch (err) {
      setError('Failed to load reading details');
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/tutors`);
      setTutors(response.data);
    } catch (err) {
      setError('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedTutor || !selectedDate) return;

    try {
      const response = await axios.get(`/api/availability/day/${selectedTutor}/${selectedDate}`, {
        params: { duration: selectedDuration }
      });
      setAvailableSlots(response.data);
      setSelectedSlot(null);
    } catch (err) {
      setError('Failed to load available time slots');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor || !selectedDate || !selectedSlot) {
      setError('Please select a tutor, date, and time slot');
      return;
    }

    setSubmitting(true);
    try {
      // Combine date and time
      const sessionDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedSlot.start_time.split(':');
      sessionDateTime.setHours(parseInt(hours), parseInt(minutes));

      await axios.post(`${API_BASE_URL}/sessions/book`, {
        tutorId: selectedTutor,
        readingId: parseInt(readingId!),
        sessionDate: sessionDateTime.toISOString(),
        durationMinutes: selectedSlot.duration_minutes
      });
      setSuccess('Session request sent successfully! The tutor will respond within 24 hours.');
      setTimeout(() => navigate('/dashboard'), 3000);
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
      <h1>{reading ? 'Book a Session' : 'Book a Session with a Tutor'} 📅</h1>
      
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
            Select Session Date
          </label>
          <input
            type="date"
            id="sessionDate"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sessionDuration" className="form-label">
            Session Duration
          </label>
          <select
            id="sessionDuration"
            className="form-input"
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
          >
            <option value={20}>20 minutes</option>
            <option value={40}>40 minutes</option>
          </select>
        </div>

        {selectedTutor && selectedDate && (
          <div className="form-group">
            <label className="form-label">Available Time Slots</label>
            {availableSlots.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No available slots for this date. Please try another date.</p>
            ) : (
              <div className="time-slots-grid">
                {availableSlots.map(slot => (
                  <label
                    key={slot.id}
                    style={{
                      display: 'block',
                      padding: '0.75rem',
                      border: `2px solid ${selectedSlot?.id === slot.id ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedSlot?.id === slot.id ? '#eff6ff' : 'white',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      value={slot.id}
                      checked={selectedSlot?.id === slot.id}
                      onChange={() => setSelectedSlot(slot)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {slot.start_time} - {slot.end_time}
                    {slot.topics && (
                      <small style={{ display: 'block', color: '#6b7280', marginTop: '0.25rem' }}>
                        Topics: {slot.topics}
                      </small>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={submitting || !selectedSlot}
          style={{ width: '100%' }}
        >
          {submitting ? 'Booking Session...' : 'Book Session'}
        </button>
      </form>
    </div>
  );
};

export default BookSession;