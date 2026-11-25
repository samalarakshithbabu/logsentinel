import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { format } from 'date-fns';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await analyticsAPI.getSummary();
      setSummary(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const stats = summary?.stats || {};
  const recentErrors = summary?.recentErrors || [];

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Errors</h3>
          <div className="stat-value">{stats.totalErrors || 0}</div>
        </div>
        <div className="stat-card critical">
          <h3>Critical</h3>
          <div className="stat-value">{stats.critical || 0}</div>
        </div>
        <div className="stat-card warning">
          <h3>High</h3>
          <div className="stat-value">{stats.high || 0}</div>
        </div>
        <div className="stat-card success">
          <h3>Resolved</h3>
          <div className="stat-value">{stats.resolved || 0}</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="recent-errors">
          <h2>Recent Errors</h2>
          {recentErrors.length === 0 ? (
            <p className="empty-state">No errors logged yet</p>
          ) : (
            <div className="error-list">
              {recentErrors.map(err => (
                <Link key={err.id} to={`/errors/${err.id}`} className="error-item">
                  <div className={`error-severity ${err.error_type}`}>
                    {err.error_type?.toUpperCase()}
                  </div>
                  <div className="error-info">
                    <div className="error-message">{err.message}</div>
                    <div className="error-meta">
                      <span>{err.error_code}</span>
                      <span>{format(new Date(err.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <Link to="/errors" className="action-btn">
            View All Errors
          </Link>
          <Link to="/analytics" className="action-btn">
            View Analytics
          </Link>
          <Link to="/projects" className="action-btn">
            Manage Projects
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;