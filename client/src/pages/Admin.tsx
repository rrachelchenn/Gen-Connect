import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  role_display: string;
  tech_comfort_level?: string;
  college?: string;
  major?: string;
  created_at: string;
}

interface Stats {
  total_users: number;
  tutors: number;
  tutees: number;
  recent_signups: number;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/all`);
      setUsers(response.data.users);
      setStats(response.data.stats);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Loading user data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">User Management</h1>
          <p>Monitor all user signups and account information</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem', 
            marginBottom: '2rem' 
          }}>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#eff6ff', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>
                {stats.total_users}
              </div>
              <div style={{ color: '#6b7280' }}>Total Users</div>
            </div>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                {stats.tutors}
              </div>
              <div style={{ color: '#6b7280' }}>Tutors</div>
            </div>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fef3c7', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>
                {stats.tutees}
              </div>
              <div style={{ color: '#6b7280' }}>Tutees</div>
            </div>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fce7f3', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#be185d' }}>
                {stats.recent_signups}
              </div>
              <div style={{ color: '#6b7280' }}>This Week</div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Details</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Signup Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: '600' }}>{user.name}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: user.role === 'tutor' ? '#dbeafe' : '#fef3c7',
                      color: user.role === 'tutor' ? '#1e40af' : '#d97706'
                    }}>
                      {user.role_display}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {user.role === 'tutee' && user.tech_comfort_level && (
                      <div>Tech Level: {user.tech_comfort_level}</div>
                    )}
                    {user.role === 'tutor' && (
                      <div>
                        {user.college && <div>College: {user.college}</div>}
                        {user.major && <div>Major: {user.major}</div>}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            onClick={fetchUsers} 
            className="btn btn-outline"
            style={{ marginRight: '1rem' }}
          >
            🔄 Refresh Data
          </button>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
