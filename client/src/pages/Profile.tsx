import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    techComfortLevel: user?.tech_comfort_level || 'beginner',
    college: user?.college || '',
    major: user?.major || '',
    bio: user?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put('/api/users/profile', formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      techComfortLevel: user?.tech_comfort_level || 'beginner',
      college: user?.college || '',
      major: user?.major || '',
      bio: user?.bio || ''
    });
    setEditing(false);
    setError('');
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1>Profile Settings 👤</h1>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Personal Information</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-outline">
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {user.role === 'tutee' && (
              <div className="form-group">
                <label htmlFor="techComfortLevel" className="form-label">
                  Tech Comfort Level
                </label>
                <select
                  id="techComfortLevel"
                  name="techComfortLevel"
                  className="form-select"
                  value={formData.techComfortLevel}
                  onChange={handleChange}
                >
                  <option value="beginner">Beginner - I'm new to most tech</option>
                  <option value="intermediate">Intermediate - I know some basics</option>
                  <option value="advanced">Advanced - I'm pretty comfortable</option>
                </select>
              </div>
            )}

            {user.role === 'tutor' && (
              <>
                <div className="form-group">
                  <label htmlFor="college" className="form-label">
                    College/University
                  </label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    className="form-input"
                    value={formData.college}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="major" className="form-label">
                    Major/Field of Study
                  </label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    className="form-input"
                    value={formData.major}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio {user.role === 'tutor' && '(visible to students)'}
              </label>
              <textarea
                id="bio"
                name="bio"
                className="form-textarea"
                value={formData.bio}
                onChange={handleChange}
                placeholder={user.role === 'tutor' 
                  ? "Tell students about yourself and your tutoring experience..."
                  : "Tell us a bit about yourself and your tech learning goals..."
                }
                rows={4}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>
                {user.name}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                {user.email}
              </p>
              <span style={{
                display: 'inline-block',
                backgroundColor: user.role === 'tutee' ? '#059669' : '#dc2626',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '15px',
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {user.role === 'tutee' ? '🧓 Senior (Tutee)' : '👩‍🎓 Student (Tutor)'}
              </span>
            </div>

            {user.role === 'tutee' && user.tech_comfort_level && (
              <p style={{ marginBottom: '1rem' }}>
                <strong>Tech Comfort Level:</strong> 
                <span style={{ 
                  marginLeft: '0.5rem',
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  textTransform: 'capitalize'
                }}>
                  {user.tech_comfort_level}
                </span>
              </p>
            )}

            {user.role === 'tutor' && (
              <>
                {user.college && (
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>College:</strong> {user.college}
                  </p>
                )}
                {user.major && (
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>Major:</strong> {user.major}
                  </p>
                )}
              </>
            )}

            {user.bio && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Bio</h4>
                <p style={{ 
                  padding: '1rem', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  lineHeight: 1.6 
                }}>
                  {user.bio}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tutor Availability Section */}
      {user.role === 'tutor' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Availability Settings</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Set your availability to help students book sessions with you. This feature is coming soon!
          </p>
          <div style={{ 
            padding: '2rem', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗓️</div>
            <h3>Availability Management</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Soon you'll be able to set your weekly availability, preferred topics, and session preferences.
            </p>
            <button className="btn btn-outline" disabled>
              Manage Availability (Coming Soon)
            </button>
          </div>
        </div>
      )}

      {/* Account Actions */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Account Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="btn btn-secondary"
          >
            🔄 Sign Out
          </button>
          <button 
            onClick={() => alert('Password reset feature coming soon!')}
            className="btn btn-outline"
          >
            🔒 Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;