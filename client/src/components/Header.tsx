import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          🧓👩‍🎓 GenConnect
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/readings" className="nav-link">
                Reading Library
              </Link>
              {user.role === 'tutee' && (
                <Link to="/browse-tutors" className="nav-link">
                  Browse Tutors
                </Link>
              )}
              {user.role === 'tutor' && (
                <Link to="/profile" className="nav-link">
                  Availability
                </Link>
              )}
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <Link to="/admin" className="nav-link">
                Admin
              </Link>
              <span className="nav-link" style={{ color: '#93c5fd' }}>
                Welcome, {user.name}!
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;