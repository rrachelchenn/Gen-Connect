import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'tutee' | 'tutor';
  tech_comfort_level?: string;
  college?: string;
  major?: string;
  bio?: string;
  created_at: string;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user has admin access
  if (!user || user.name !== 'rachel chen') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Access Denied</h1>
          </div>
          <div className="card-body">
            <p>You do not have permission to access the admin panel.</p>
            <p>Only the account "rachel chen" can access this area.</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Failed to fetch users');
        }
        return;
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalUsers = users.length;
  const tutors = users.filter(u => u.role === 'tutor').length;
  const tutees = users.filter(u => u.role === 'tutee').length;
  const recentSignups = users.filter(u => {
    const signupDate = new Date(u.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return signupDate > weekAgo;
  }).length;

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div className="card">
          <div className="card-body">
            <p>Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Admin Panel</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            User Management Dashboard
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>{totalUsers}</h3>
            <p style={{ margin: 0, color: '#1e40af' }}>Total Users</p>
          </div>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#f0fdf4', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>{tutors}</h3>
            <p style={{ margin: 0, color: '#059669' }}>Tutors</p>
          </div>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#fef3c7', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#d97706' }}>{tutees}</h3>
            <p style={{ margin: 0, color: '#d97706' }}>Tutees</p>
          </div>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#fdf2f8', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#be185d' }}>{recentSignups}</h3>
            <p style={{ margin: 0, color: '#be185d' }}>Recent Signups (This Week)</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <h2>All Users</h2>
          </div>
          <div className="card-body">
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: '#f9fafb' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: '#f9fafb' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: '#f9fafb' }}>Role</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: '#f9fafb' }}>College</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: '#f9fafb' }}>Major</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: '#f9fafb' }}>Tech Level</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', backgroundColor: '#f9fafb' }}>Signup Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem' }}>{user.name}</td>
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
                            {user.role === 'tutor' ? 'Tutor' : 'Tutee'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{user.college || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{user.major || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{user.tech_comfort_level || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
