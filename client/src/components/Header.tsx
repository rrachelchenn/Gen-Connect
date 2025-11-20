import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          🧓👩‍🎓 GenConnect
        </Link>
        
        <div className="nav-links">
          <Link to="/browse-tutors" className="nav-link">
            Browse Tutors
          </Link>
          <Link to="/lessons" className="nav-link">
            Lessons
          </Link>
          <Link to="/apply" className="btn btn-primary">
            Become a Tutor
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;