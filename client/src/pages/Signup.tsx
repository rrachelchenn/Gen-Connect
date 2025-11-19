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
    role: 'tutor' as 'tutee' | 'tutor',
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
        role: 'tutor',
        college: formData.college,
        major: formData.major
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
            Become a GenConnect Tutor
          </h1>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#6b7280' }}>
            Join our community of college students helping seniors learn technology
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          {/* Tutor-specific fields */}
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

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Tutor Account...' : 'Become a Tutor'}
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