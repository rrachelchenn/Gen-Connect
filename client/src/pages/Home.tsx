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
          Bridging the Digital Divide
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
          Connecting tech-savvy college students with older adults who want to master modern technology
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

      {/* Benefits Section */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Why Choose GenConnect?
        </h2>
        
        <div className="grid grid-2">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👴👵</div>
            <h3>For Older Adults</h3>
            <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>✓ Patient, understanding tutors</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Step-by-step guidance</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ No judgment, just help</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Practical, real-world skills</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Safe, supportive environment</li>
            </ul>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
            <h3>For College Students</h3>
            <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>✓ Make a real difference</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Build teaching experience</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Flexible hours</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Help bridge the digital gap</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Earn while helping others</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Essential Tech Skills for Modern Life
        </h2>
        
        <div className="grid grid-3">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
            <h3>Smartphone Mastery</h3>
            <p>Learn to use your phone confidently - from basic calls to apps and settings.</p>
            <div className="tag">Basics</div>
            <div className="tag">Apps</div>
            <div className="tag">Settings</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <h3>Online Shopping</h3>
            <p>Shop safely online for groceries, essentials, and gifts with confidence.</p>
            <div className="tag">Shopping</div>
            <div className="tag">Safety</div>
            <div className="tag">Payments</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3>Digital Communication</h3>
            <p>Stay connected with family through text, email, and social media.</p>
            <div className="tag">Texting</div>
            <div className="tag">Email</div>
            <div className="tag">Social Media</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
            <h3>Video Calls</h3>
            <p>See and talk to family and friends face-to-face, even when apart.</p>
            <div className="tag">FaceTime</div>
            <div className="tag">Zoom</div>
            <div className="tag">Family</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
            <h3>Photo & Memories</h3>
            <p>Take, organize, and share photos with family and friends.</p>
            <div className="tag">Camera</div>
            <div className="tag">Albums</div>
            <div className="tag">Sharing</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3>Online Safety</h3>
            <p>Protect yourself from scams and keep your information secure.</p>
            <div className="tag">Privacy</div>
            <div className="tag">Security</div>
            <div className="tag">Scam Prevention</div>
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
              <h3 className="card-title">📚 1. Choose What to Learn</h3>
            </div>
            <p>Pick from our library of easy-to-follow guides on the tech skills that matter most in today's world.</p>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📅 2. Book Your Tutor</h3>
            </div>
            <p>Schedule a session with a patient college student who will guide you step-by-step through your learning.</p>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💬 3. Learn at Your Pace</h3>
            </div>
            <p>In your live session, ask questions, practice together, and get the personalized help you need.</p>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">✨ 4. Build Confidence</h3>
            </div>
            <p>Gain the skills and confidence to use technology independently and stay connected with loved ones.</p>
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
          <h2 style={{ marginBottom: '1rem' }}>Ready to Bridge the Digital Divide?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Whether you want to learn modern technology or help others master it, GenConnect is here for you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup?role=tutee" className="btn btn-primary btn-large">
              I Want to Learn Tech
            </Link>
            <Link to="/signup?role=tutor" className="btn btn-outline btn-large">
              I Want to Help Others
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;