import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface TutorProfile {
  id: number;
  name: string;
  email: string;
  college: string;
  major: string;
  bio: string;
  specialties: string[];
  availability_hours: string;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tutors/browse`);
      setTutors(response.data.slice(0, 6)); // Show first 6 tutors on home page
    } catch (err) {
      console.error('Error fetching tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTutors = () => {
    document.getElementById('tutors-section')?.scrollIntoView({ behavior: 'smooth' });
  };

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
          {user && user.role === 'tutor' ? (
            <Link to="/dashboard" className="btn btn-large" style={{ 
              backgroundColor: 'white', 
              color: '#1e3a8a',
              border: '2px solid white'
            }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <button onClick={scrollToTutors} className="btn btn-large" style={{ 
                backgroundColor: 'white', 
                color: '#1e3a8a',
                border: '2px solid white'
              }}>
                Browse Tutors
              </button>
              <Link to="/browse-tutors" className="btn btn-large btn-outline" style={{
                borderColor: 'white',
                color: 'white'
              }}>
                View All Tutors
              </Link>
            </>
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
              <h3 className="card-title">👀 1. Browse Available Tutors</h3>
            </div>
            <p>Scroll through our college student tutors and find someone whose skills, interests, and availability match what you're looking for.</p>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">✍️ 2. Fill Out a Contact Form</h3>
            </div>
            <p>Click on a tutor's profile and fill out a simple contact form with your name, email, phone, and what you'd like to learn.</p>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📞 3. Tutor Reaches Out to You</h3>
            </div>
            <p>The tutor will receive your request and contact you directly to schedule a convenient time for your session.</p>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">✨ 4. Learn Together</h3>
            </div>
            <p>Meet with your tutor, learn at your own pace, and build confidence with technology. No signup required!</p>
          </div>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section id="tutors-section" style={{ marginTop: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Meet Our Tutors
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading tutors...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-3">
              {tutors.map(tutor => (
                <div key={tutor.id} className="card">
                  <div className="card-header">
                    <h4 className="card-title">{tutor.name}</h4>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p><strong>College:</strong> {tutor.college}</p>
                    <p><strong>Major:</strong> {tutor.major}</p>
                    <p><strong>Available:</strong> {tutor.availability_hours}</p>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Specialties:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      {tutor.specialties.slice(0, 3).map(specialty => (
                        <span key={specialty} className="tag" style={{ marginRight: '0.5rem', marginBottom: '0.5rem', display: 'inline-block' }}>
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      {tutor.bio.substring(0, 100)}...
                    </p>
                  </div>

                  <Link 
                    to={`/browse-tutors?tutor=${tutor.id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
                  >
                    Contact {tutor.name.split(' ')[0]}
                  </Link>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/browse-tutors" className="btn btn-large btn-outline">
                View All Tutors
              </Link>
            </div>
          </>
        )}
      </section>

      {/* CTA for Tutors */}
      <section style={{ 
        textAlign: 'center', 
        marginTop: '4rem', 
        padding: '3rem 2rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '12px'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Are You a College Student?</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Join GenConnect as a tutor and help bridge the digital divide while building valuable teaching experience.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup?role=tutor" className="btn btn-primary btn-large">
            Become a Tutor
          </Link>
          <Link to="/login" className="btn btn-outline btn-large">
            Tutor Login
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;