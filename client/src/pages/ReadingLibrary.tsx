import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface Reading {
  id: number;
  title: string;
  summary: string;
  content: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  topic_tags: string;
  created_at: string;
}

const ReadingLibrary: React.FC = () => {
  const { user } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedReading, setExpandedReading] = useState<number | null>(null);

  useEffect(() => {
    fetchReadings();
  }, []);

  useEffect(() => {
    filterReadings();
  }, [readings, searchTerm, selectedDifficulty]);

  const fetchReadings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/readings`);
      setReadings(response.data);
    } catch (err: any) {
      setError('Failed to load readings');
      console.error('Error fetching readings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterReadings = () => {
    let filtered = readings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(reading =>
        reading.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.topic_tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(reading => reading.difficulty_level === selectedDifficulty);
    }

    setFilteredReadings(filtered);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'difficulty-easy';
    }
  };

  const toggleExpanded = (readingId: number) => {
    setExpandedReading(expandedReading === readingId ? null : readingId);
  };

  const formatTags = (tags: string) => {
    return tags.split(',').map(tag => tag.trim());
  };

  if (loading) {
    return <div className="loading">Loading reading library...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '3rem' }}>
        <h1>Reading Library 📚</h1>
        <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
          Explore our collection of easy-to-understand tech guides. 
          {user?.role === 'tutee' && ' Choose a reading and book a session to get personalized help!'}
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="search" className="form-label">
              Search readings
            </label>
            <input
              type="text"
              id="search"
              className="form-input"
              placeholder="Search by title, topic, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="difficulty" className="form-label">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              className="form-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {filteredReadings.length > 0 && (
          <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '1rem' }}>
            Showing {filteredReadings.length} of {readings.length} readings
          </p>
        )}
      </div>

      {/* Readings Grid */}
      {filteredReadings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3>No readings found</h3>
          <p>Try adjusting your search terms or difficulty filter.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedDifficulty('all');
            }}
            className="btn btn-outline"
            style={{ marginTop: '1rem' }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid">
          {filteredReadings.map((reading) => (
            <div key={reading.id} className="card">
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>
                    {reading.title}
                  </h3>
                  <span className={`difficulty-badge ${getDifficultyColor(reading.difficulty_level)}`}>
                    {reading.difficulty_level}
                  </span>
                </div>

                <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: 1.6 }}>
                  {reading.summary}
                </p>

                {/* Tags */}
                <div style={{ marginBottom: '1rem' }}>
                  {formatTags(reading.topic_tags).map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Preview Content */}
                {expandedReading === reading.id && (
                  <div style={{ 
                    marginBottom: '1rem', 
                    padding: '1rem', 
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ marginBottom: '1rem', color: '#1e40af' }}>Reading Content:</h4>
                    <p style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                      {reading.content}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => toggleExpanded(reading.id)}
                    className="btn btn-outline"
                  >
                    {expandedReading === reading.id ? 'Hide Preview' : 'Preview Content'}
                  </button>

                  {user?.role === 'tutee' && (
                    <Link 
                      to={`/book-session/${reading.id}`}
                      className="btn btn-primary"
                    >
                      📅 Book Session
                    </Link>
                  )}

                  {user?.role === 'tutor' && (
                    <span style={{ 
                      color: '#6b7280', 
                      fontSize: '0.95rem',
                      fontStyle: 'italic'
                    }}>
                      Students can book sessions for this topic
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action for Non-logged Users */}
      {!user && (
        <div className="card" style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          backgroundColor: '#f0f9ff',
          border: '2px solid #3b82f6'
        }}>
          <h3 style={{ color: '#1e40af', marginBottom: '1rem' }}>
            Ready to Start Learning?
          </h3>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
            Sign up to book personalized tutoring sessions for any of these topics!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary btn-large">
              Sign Up as Senior (Tutee)
            </Link>
            <Link to="/signup" className="btn btn-outline btn-large">
              Join as College Tutor
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingLibrary;