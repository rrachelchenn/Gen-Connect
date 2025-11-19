import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title" style={{ textAlign: 'center' }}>
            Tutor Login
          </h1>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#6b7280' }}>
            Sign in to manage your tutoring sessions
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
                No login needed! Just browse our tutors on the{' '}
                <Link to="/browse-tutors" style={{ color: '#3b82f6', fontWeight: '600' }}>
                  Browse Tutors page
                </Link>
                {' '}and contact them directly.
              </span>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          paddingTop: '2rem', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <p style={{ fontSize: '1.1rem' }}>
            Want to become a tutor?{' '}
            <Link 
              to="/signup" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none', 
                fontWeight: '600' 
              }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;