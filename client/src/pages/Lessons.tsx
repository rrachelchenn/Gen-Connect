import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useLocation } from 'react-router-dom';

interface Article {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: string;
  topics: string[];
  content: string;
}

const Lessons: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const location = useLocation();

  const categories = ['All', 'Communication', 'Finance', 'Safety', 'Shopping', 'Photography', 'Smart Home', 'Navigation', 'Social Media'];
  const difficulties = ['All', 'Beginner', 'Intermediate'];

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [articles, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    // Handle anchor link navigation
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#article-', '');
        const articleId = parseInt(id);
        if (articleId) {
          setExpandedArticle(articleId);
          const element = document.getElementById(`article-${articleId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 300);
    }
  }, [location, articles]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tutors/articles`);
      setArticles(response.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...articles];

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (selectedDifficulty && selectedDifficulty !== 'All') {
      filtered = filtered.filter(article => article.difficulty === selectedDifficulty);
    }

    setFilteredArticles(filtered);
  };

  const toggleArticle = (id: number) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  if (loading) return <div className="loading">Loading lessons...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Tech Lessons & Discussion Topics</h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          Browse our curated collection of tech lessons designed specifically for seniors. 
          Each lesson is taught by our patient, experienced tutors at no cost.
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Filter Lessons</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              {categories.map(category => (
                <option key={category} value={category === 'All' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">Difficulty</label>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="form-input"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty === 'All' ? '' : difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>

          <div style={{ alignSelf: 'end' }}>
            <button 
              onClick={() => {
                setSelectedCategory('');
                setSelectedDifficulty('');
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginBottom: '1rem' }}>
        <h3>{filteredArticles.length} Lessons Available</h3>
      </div>

      {/* Articles List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredArticles.map(article => (
          <div 
            key={article.id} 
            id={`article-${article.id}`}
            className="card"
            style={{
              border: expandedArticle === article.id ? '2px solid #3b82f6' : undefined,
              transition: 'all 0.3s ease'
            }}
          >
            <div 
              onClick={() => toggleArticle(article.id)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a' }}>
                    {article.title}
                  </h3>
                  <p style={{ margin: 0, color: '#6b7280' }}>
                    {article.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  <span className="tag">{article.difficulty}</span>
                  <span className="tag" style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}>
                    {article.category}
                  </span>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                fontSize: '0.9rem',
                color: '#6b7280',
                paddingBottom: '1rem',
                borderBottom: expandedArticle === article.id ? '1px solid #e5e7eb' : 'none'
              }}>
                <span>⏱️ {article.estimated_time}</span>
                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                  {expandedArticle === article.id ? '▼ Click to collapse' : '▶ Click to expand'}
                </span>
              </div>
            </div>

            {expandedArticle === article.id && (
              <div style={{ 
                marginTop: '1rem',
                paddingTop: '1rem',
                animation: 'fadeIn 0.3s ease'
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>What You'll Learn</h4>
                  <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151' }}>
                    {article.content}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Topics Covered</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {article.topics.map(topic => (
                      <span key={topic} className="tag" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  backgroundColor: '#f0f9ff',
                  padding: '1rem',
                  borderRadius: '8px',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <p style={{ margin: 0, color: '#1e3a8a' }}>
                    <strong>💡 Ready to learn this?</strong> Browse our tutors to find someone who specializes in this topic!
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No lessons found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
};

export default Lessons;

