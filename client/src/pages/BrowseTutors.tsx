import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import TutorContactForm from '../components/TutorContactForm';

interface TutorProfile {
  id: number;
  name: string;
  email: string;
  college: string;
  major: string;
  bio: string;
  age: number;
  industry: string;
  specialties: string[];
  hourly_rate: number;
  total_sessions: number;
  average_rating: number;
  total_reviews: number;
  tutoring_style: string;
  availability_hours: string;
  experience_years: number;
}

interface Review {
  id: number;
  tutor_id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  date: string;
  session_topic: string;
}

const BrowseTutors: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [tutorReviews, setTutorReviews] = useState<Review[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactTutor, setContactTutor] = useState<TutorProfile | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    industry: '',
    specialty: '',
    minRating: 0,
    maxRate: 100,
    ageRange: '',
    experience: ''
  });

  const industries = [
    'Technology', 'Healthcare', 'Education', 'Business', 
    'Engineering', 'Finance', 'Marketing', 'Design'
  ];

  const specialties = [
    'Smartphone Basics', 'Social Media', 'Online Shopping', 
    'Video Calling', 'Email & Messaging', 'Online Banking',
    'Photo Sharing', 'Computer Basics', 'Internet Safety'
  ];

  useEffect(() => {
    fetchTutors();
  }, []);

  // Auto-open contact form if tutor ID is in URL
  useEffect(() => {
    const tutorIdParam = searchParams.get('tutor');
    if (tutorIdParam && tutors.length > 0) {
      const tutorId = parseInt(tutorIdParam);
      const tutor = tutors.find(t => t.id === tutorId);
      if (tutor) {
        openContactForm(tutor);
      }
    }
  }, [searchParams, tutors]);

  useEffect(() => {
    applyFilters();
  }, [tutors, filters]);

  const fetchTutors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tutors/browse`);
      setTutors(response.data);
    } catch (err: any) {
      console.error('Error fetching tutors:', err);
      setError('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorReviews = async (tutorId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tutors/${tutorId}/reviews`);
      setTutorReviews(response.data);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setTutorReviews([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...tutors];

    if (filters.industry) {
      filtered = filtered.filter(tutor => tutor.industry === filters.industry);
    }

    if (filters.specialty) {
      filtered = filtered.filter(tutor => 
        tutor.specialties.includes(filters.specialty)
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(tutor => tutor.average_rating >= filters.minRating);
    }

    if (filters.maxRate < 100) {
      filtered = filtered.filter(tutor => tutor.hourly_rate <= filters.maxRate);
    }

    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
      filtered = filtered.filter(tutor => 
        tutor.age >= minAge && tutor.age <= maxAge
      );
    }

    if (filters.experience) {
      const minExp = parseInt(filters.experience);
      filtered = filtered.filter(tutor => tutor.experience_years >= minExp);
    }

    setFilteredTutors(filtered);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      specialty: '',
      minRating: 0,
      maxRate: 100,
      ageRange: '',
      experience: ''
    });
  };

  const openTutorProfile = (tutor: TutorProfile) => {
    setSelectedTutor(tutor);
    fetchTutorReviews(tutor.id);
  };

  const closeTutorProfile = () => {
    setSelectedTutor(null);
    setTutorReviews([]);
  };

  const openContactForm = (tutor: TutorProfile) => {
    setContactTutor(tutor);
    setShowContactForm(true);
  };

  const closeContactForm = () => {
    setContactTutor(null);
    setShowContactForm(false);
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading) return <div className="loading">Loading tutors...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Browse Tutors</h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          Find the perfect tutor based on their expertise, teaching style, and reviews from other learners.
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Filter Tutors</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Industry Background</label>
            <select 
              value={filters.industry} 
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              className="form-input"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Specialty</label>
            <select 
              value={filters.specialty} 
              onChange={(e) => handleFilterChange('specialty', e.target.value)}
              className="form-input"
            >
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Rating</label>
            <select 
              value={filters.minRating} 
              onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
              className="form-input"
            >
              <option value={0}>Any Rating</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Age Range</label>
            <select 
              value={filters.ageRange} 
              onChange={(e) => handleFilterChange('ageRange', e.target.value)}
              className="form-input"
            >
              <option value="">Any Age</option>
              <option value="18-22">18-22 years</option>
              <option value="23-26">23-26 years</option>
              <option value="27-30">27+ years</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Experience</label>
            <select 
              value={filters.experience} 
              onChange={(e) => handleFilterChange('experience', e.target.value)}
              className="form-input"
            >
              <option value="">Any Experience</option>
              <option value="1">1+ years</option>
              <option value="2">2+ years</option>
              <option value="3">3+ years</option>
            </select>
          </div>

          <div style={{ alignSelf: 'end' }}>
            <button 
              onClick={clearFilters}
              className="btn btn-outline"
              style={{ width: '100%' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{filteredTutors.length} Tutors Found</h3>
      </div>

      {/* Tutor Grid */}
      <div className="grid grid-2">
        {filteredTutors.map(tutor => (
          <div key={tutor.id} className="card">
            <div className="card-header">
              <h4 className="card-title">{tutor.name}</h4>
              <div style={{ fontSize: '1.2rem', color: '#f59e0b' }}>
                {renderStars(tutor.average_rating)} ({tutor.total_reviews})
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p><strong>College:</strong> {tutor.college}</p>
              <p><strong>Major:</strong> {tutor.major}</p>
              <p><strong>Industry:</strong> {tutor.industry}</p>
              <p><strong>Experience:</strong> {tutor.experience_years} years</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Specialties:</strong>
              <div style={{ marginTop: '0.5rem' }}>
                {tutor.specialties.map(specialty => (
                  <span key={specialty} className="tag" style={{ marginRight: '0.5rem' }}>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                {tutor.bio.substring(0, 120)}...
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  {tutor.total_sessions} sessions completed
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#059669' }}>
                ${tutor.hourly_rate}/hour
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => openTutorProfile(tutor)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                View Profile
              </button>
              <button 
                onClick={() => openContactForm(tutor)}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No tutors found</h3>
          <p>Try adjusting your filters to see more results.</p>
          <button onClick={clearFilters} className="btn btn-primary">
            Clear All Filters
          </button>
        </div>
      )}

      {/* Tutor Profile Modal */}
      {selectedTutor && (
        <div className="modal-overlay" onClick={closeTutorProfile}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>{selectedTutor.name}</h2>
              <button onClick={closeTutorProfile} className="modal-close">×</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h4>About</h4>
                  <p><strong>College:</strong> {selectedTutor.college}</p>
                  <p><strong>Major:</strong> {selectedTutor.major}</p>
                  <p><strong>Industry:</strong> {selectedTutor.industry}</p>
                  <p><strong>Age:</strong> {selectedTutor.age}</p>
                  <p><strong>Experience:</strong> {selectedTutor.experience_years} years</p>
                  <p><strong>Availability:</strong> {selectedTutor.availability_hours}</p>
                </div>

                <div>
                  <h4>Stats</h4>
                  <p><strong>Rating:</strong> {renderStars(selectedTutor.average_rating)} ({selectedTutor.average_rating}/5)</p>
                  <p><strong>Sessions:</strong> {selectedTutor.total_sessions} completed</p>
                  <p><strong>Reviews:</strong> {selectedTutor.total_reviews}</p>
                  <p><strong>Rate:</strong> ${selectedTutor.hourly_rate}/hour</p>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4>Bio & Teaching Style</h4>
                <p>{selectedTutor.bio}</p>
                <p><strong>Teaching Style:</strong> {selectedTutor.tutoring_style}</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4>Specialties</h4>
                <div style={{ marginTop: '0.5rem' }}>
                  {selectedTutor.specialties.map(specialty => (
                    <span key={specialty} className="tag" style={{ marginRight: '0.5rem' }}>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4>Reviews ({tutorReviews.length})</h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {tutorReviews.map(review => (
                    <div key={review.id} className="card" style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong>{review.reviewer_name}</strong>
                        <span style={{ color: '#f59e0b' }}>{renderStars(review.rating)}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Session: {review.session_topic}
                      </p>
                      <p>{review.comment}</p>
                      <small style={{ color: '#9ca3af' }}>{new Date(review.date).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={closeTutorProfile} className="btn btn-outline" style={{ flex: 1 }}>
                  Close
                </button>
                <button 
                  onClick={() => {
                    closeTutorProfile();
                    openContactForm(selectedTutor);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Contact {selectedTutor.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && contactTutor && (
        <TutorContactForm
          tutorId={contactTutor.id}
          tutorName={contactTutor.name}
          onClose={closeContactForm}
        />
      )}
    </div>
  );
};

export default BrowseTutors;
