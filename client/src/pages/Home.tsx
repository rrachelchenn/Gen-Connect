import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
        color: 'white', 
        padding: '4rem 2rem', 
        textAlign: 'center',
        borderRadius: '12px',
        marginBottom: '3rem'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>
          Connecting Senior Citizens with College Students
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
          For tech tutoring sessions based on curated digital readings
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!user ? (
            <>
              <Link to="/signup" className="btn btn-large" style={{ 
                backgroundColor: 'white', 
                color: '#1e3a8a',
                border: '2px solid white'
              }}>
                Get Started
              </Link>
              <Link to="/readings" className="btn btn-large btn-outline" style={{
                borderColor: 'white',
                color: 'white'
              }}>
                Browse Topics
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn btn-large" style={{ 
              backgroundColor: 'white', 
              color: '#1e3a8a',
              border: '2px solid white'
            }}>
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Browse Reading Topics
        </h2>
        
        <div className="grid grid-3">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
            <h3>Digital Literacy</h3>
            <p>Learn smartphone basics, apps, and digital communication.</p>
            <div className="tag">Smartphones</div>
            <div className="tag">Apps</div>
            <div className="tag">Communication</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <h3>Online Shopping</h3>
            <p>Master online grocery shopping, e-commerce, and digital payments.</p>
            <div className="tag">Shopping</div>
            <div className="tag">Groceries</div>
            <div className="tag">Payments</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3>Write & Connect</h3>
            <p>Understand modern slang, social media, and digital etiquette.</p>
            <div className="tag">Social Media</div>
            <div className="tag">Communication</div>
            <div className="tag">Safety</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
            <h3>Video Calling</h3>
            <p>Connect with family through video calls and virtual meetings.</p>
            <div className="tag">Video Calls</div>
            <div className="tag">Family</div>
            <div className="tag">Technology</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
            <h3>Creative Tech</h3>
            <p>Take better photos, edit images, and share memories.</p>
            <div className="tag">Photography</div>
            <div className="tag">Creative</div>
            <div className="tag">Sharing</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3>Safety & Security</h3>
            <p>Stay safe online with privacy settings and scam awareness.</p>
            <div className="tag">Privacy</div>
            <div className="tag">Security</div>
            <div className="tag">Safety</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
          How GenConnect Works
        </h2>
        
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📚 1. Choose a Reading</h3>
            </div>
            <p>Browse our library of easy-to-understand guides on various tech topics. Each reading includes clear explanations and helpful tips.</p>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📅 2. Book a Session</h3>
            </div>
            <p>Schedule a one-on-one session with a friendly college student who can help you understand and practice what you've read.</p>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💬 3. Learn Together</h3>
            </div>
            <p>Join your live session where you can ask questions, practice together, and get personalized help with your tech questions.</p>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">✨ 4. Share Feedback</h3>
            </div>
            <p>After your session, share what you learned and get recommendations for follow-up resources or future topics to explore.</p>
          </div>
        </div>
      </section>

      {!user && (
        <section style={{ 
          textAlign: 'center', 
          marginTop: '4rem', 
          padding: '3rem 2rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to Start Learning?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Join GenConnect today and connect with helpful tutors for personalized tech assistance.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary btn-large">
              Sign Up as Senior (Tutee)
            </Link>
            <Link to="/signup" className="btn btn-outline btn-large">
              Join as College Tutor
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;