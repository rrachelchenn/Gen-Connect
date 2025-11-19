import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface TutorContactFormProps {
  tutorId: number;
  tutorName: string;
  onClose: () => void;
}

const TutorContactForm: React.FC<TutorContactFormProps> = ({ tutorId, tutorName, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredTopics: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/tutors/contact`, {
        tutorId,
        ...formData
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send contact request');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#059669', marginBottom: '1rem' }}>Request Sent!</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              {tutorName} will receive your message and contact you soon to schedule a session.
            </p>
            <button onClick={onClose} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Contact {tutorName}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
            Fill out this form and {tutorName} will contact you to schedule a session.
          </p>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredTopics" className="form-label">
                What would you like to learn? *
              </label>
              <input
                type="text"
                id="preferredTopics"
                name="preferredTopics"
                className="form-input"
                value={formData.preferredTopics}
                onChange={handleChange}
                required
                placeholder="e.g., Smartphone basics, Email, Video calling"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Additional Information (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                className="form-input"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Any other details you'd like to share (preferred times, specific questions, etc.)"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TutorContactForm;

