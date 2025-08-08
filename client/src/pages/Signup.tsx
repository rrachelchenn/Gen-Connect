import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'tutee' as 'tutee' | 'tutor',
    techComfortLevel: 'beginner',
    college: '',
    major: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Set role from URL parameter if provided
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'tutor' || roleParam === 'tutee') {
      setFormData(prev => ({
        ...prev,
        role: roleParam as 'tutee' | 'tutor'
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        techComfortLevel: formData.role === 'tutee' ? formData.techComfortLevel : undefined,
        college: formData.role === 'tutor' ? formData.college : undefined,
        major: formData.role === 'tutor' ? formData.major : undefined
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title" style={{ textAlign: 'center' }}>
            Join GenConnect
          </h1>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#6b7280' }}>
            Connect with others for tech learning sessions
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">
              I want to sign up as:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '1rem', 
                border: `2px solid ${formData.role === 'tutee' ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: formData.role === 'tutee' ? '#eff6ff' : 'white'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="tutee"
                  checked={formData.role === 'tutee'}
                  onChange={handleChange}
                  style={{ marginRight: '0.5rem' }}
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                    🧓 Senior Citizen (Tutee)
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    I want to learn tech skills
                  </div>
                </div>
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '1rem', 
                border: `2px solid ${formData.role === 'tutor' ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: formData.role === 'tutor' ? '#eff6ff' : 'white'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="tutor"
                  checked={formData.role === 'tutor'}
                  onChange={handleChange}
                  style={{ marginRight: '0.5rem' }}
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                    👩‍🎓 College Student (Tutor)
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    I want to help others with tech
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
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
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Create a password (at least 6 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          {/* Role-specific fields */}
          {formData.role === 'tutee' && (
            <div className="form-group">
              <label htmlFor="techComfortLevel" className="form-label">
                How comfortable are you with technology?
              </label>
              <select
                id="techComfortLevel"
                name="techComfortLevel"
                className="form-select"
                value={formData.techComfortLevel}
                onChange={handleChange}
              >
                <option value="beginner">Beginner - I'm new to most tech</option>
                <option value="intermediate">Intermediate - I know some basics</option>
                <option value="advanced">Advanced - I'm pretty comfortable</option>
              </select>
            </div>
          )}

          {formData.role === 'tutor' && (
            <>
              <div className="form-group">
                <label htmlFor="college" className="form-label">
                  College/University
                </label>
                <input
                  type="text"
                  id="college"
                  name="college"
                  className="form-input"
                  value={formData.college}
                  onChange={handleChange}
                  required
                  placeholder="Enter your college or university"
                />
              </div>

              <div className="form-group">
                <label htmlFor="major" className="form-label">
                  Major/Field of Study
                </label>
                <input
                  type="text"
                  id="major"
                  name="major"
                  className="form-input"
                  value={formData.major}
                  onChange={handleChange}
                  required
                  placeholder="Enter your major or field of study"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          paddingTop: '2rem', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <p style={{ fontSize: '1.1rem' }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none', 
                fontWeight: '600' 
              }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;