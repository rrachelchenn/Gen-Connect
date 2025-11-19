import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const TutorApplication: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: 'UC Berkeley',
    major: '',
    age: '',
    specialties: [] as string[],
    bio: '',
    availability: '',
    experience: '',
    why_tutor: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const specialtyOptions = [
    'Smartphone Basics',
    'Social Media',
    'Online Shopping',
    'Video Calling',
    'Email & Messaging',
    'Online Banking',
    'Photo Sharing',
    'Computer Basics',
    'Internet Safety'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.specialties.length === 0) {
      setError('Please select at least one specialty');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/tutors/apply`, formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#059669', marginBottom: '1rem' }}>Application Submitted!</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              Thank you for your interest in becoming a GenConnect tutor!
            </p>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              We'll review your application and reach out to you within 3-5 business days to schedule an interview.
              Check your email for updates.
            </p>
            <Link to="/" className="btn btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title" style={{ textAlign: 'center' }}>
            Become a GenConnect Tutor
          </h1>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#6b7280' }}>
            Apply to help seniors learn technology
          </p>
        </div>

        {/* Info Box for Seniors */}
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '2px solid #3b82f6'
        }}>
          <p style={{ margin: 0, fontSize: '1rem', color: '#1e40af' }}>
            <strong>👋 Are you a senior citizen looking to learn?</strong><br />
            <span style={{ color: '#6b7280' }}>
              No signup needed! Just browse our tutors on the{' '}
              <Link to="/browse-tutors" style={{ color: '#3b82f6', fontWeight: '600' }}>
                Browse Tutors page
              </Link>
              {' '}and contact them directly.
            </span>
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
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
              placeholder="your.email@berkeley.edu"
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
            <label htmlFor="college" className="form-label">
              College/University *
            </label>
            <input
              type="text"
              id="college"
              name="college"
              className="form-input"
              value={formData.college}
              onChange={handleChange}
              required
              placeholder="UC Berkeley"
            />
          </div>

          <div className="form-group">
            <label htmlFor="major" className="form-label">
              Major/Field of Study *
            </label>
            <input
              type="text"
              id="major"
              name="major"
              className="form-input"
              value={formData.major}
              onChange={handleChange}
              required
              placeholder="e.g., Computer Science, Psychology"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age" className="form-label">
              Age *
            </label>
            <input
              type="number"
              id="age"
              name="age"
              className="form-input"
              value={formData.age}
              onChange={handleChange}
              required
              min="18"
              max="100"
              placeholder="18"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Tech Specialties * (Select all that apply)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {specialtyOptions.map(specialty => (
                <label 
                  key={specialty}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    border: `2px solid ${formData.specialties.includes(specialty) ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.specialties.includes(specialty) ? '#eff6ff' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty)}
                    onChange={() => handleSpecialtyToggle(specialty)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ fontSize: '0.95rem' }}>{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              Tell us about yourself * (2-3 sentences)
            </label>
            <textarea
              id="bio"
              name="bio"
              className="form-input"
              value={formData.bio}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Share your background, why you want to teach seniors, and any relevant experience..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="availability" className="form-label">
              General Availability *
            </label>
            <input
              type="text"
              id="availability"
              name="availability"
              className="form-input"
              value={formData.availability}
              onChange={handleChange}
              required
              placeholder="e.g., Tuesday and Thursday afternoons, weekends"
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience" className="form-label">
              Teaching/Tutoring Experience
            </label>
            <textarea
              id="experience"
              name="experience"
              className="form-input"
              value={formData.experience}
              onChange={handleChange}
              rows={3}
              placeholder="Any teaching, tutoring, or mentoring experience (can be informal, like helping family members)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="why_tutor" className="form-label">
              Why do you want to be a GenConnect tutor? *
            </label>
            <textarea
              id="why_tutor"
              name="why_tutor"
              className="form-input"
              value={formData.why_tutor}
              onChange={handleChange}
              required
              rows={3}
              placeholder="What motivates you to help seniors learn technology?"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '0.95rem', color: '#6b7280' }}>
            Questions? Email us at <a href="mailto:info@genconnect.org" style={{ color: '#3b82f6' }}>info@genconnect.org</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorApplication;