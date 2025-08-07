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
            Welcome Back to GenConnect
          </h1>
          <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#6b7280' }}>
            Sign in to continue your learning journey
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            Don't have an account?{' '}
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

      {/* Demo accounts info */}
      <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f0f9ff' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1e40af' }}>
          Try GenConnect with Demo Accounts
        </h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#059669' }}>Senior (Tutee)</h4>
            <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
              <strong>Email:</strong> demo.senior@genconnect.com
            </p>
            <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
              <strong>Password:</strong> demo123
            </p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#dc2626' }}>Student (Tutor)</h4>
            <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
              <strong>Email:</strong> demo.student@genconnect.com
            </p>
            <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
              <strong>Password:</strong> demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;