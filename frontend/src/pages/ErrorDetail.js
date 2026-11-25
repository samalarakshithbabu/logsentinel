import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { errorLogsAPI } from '../services/api';
import { format } from 'date-fns';

const ErrorDetail = () => {
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchError();
  }, [id]);

  const fetchError = async () => {
    try {
      const response = await errorLogsAPI.getOne(id);
      setError(response.data);
    } catch (err) {
      console.error('Failed to fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await errorLogsAPI.update(id, { status: newStatus });
      setError(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading error details...</div>;
  }

  if (!error) {
    return <div className="error">Error not found</div>;
  }

  return (
    <div className="error-detail-page">
      <div className="detail-header">
        <div className="header-main">
          <span className={`badge large ${error.error_type}`}>
            {error.error_type?.toUpperCase()}
          </span>
          <h1>{error.error_code}</h1>
          <p className="status-row">
            Status: 
            <select
              value={error.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
            >
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>
          </p>
        </div>
        <div className="header-meta">
          <div className="meta-item">
            <span className="meta-label">Created</span>
            <span className="meta-value">
              {format(new Date(error.created_at), 'MMMM d, yyyy HH:mm:ss')}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Environment</span>
            <span className="meta-value">{error.environment || 'Unknown'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Version</span>
            <span className="meta-value">{error.version || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <section className="message-section">
          <h2>Error Message</h2>
          <div className="message-box">{error.message}</div>
        </section>

        {error.stack_trace && (
          <section className="stack-trace-section">
            <h2>Stack Trace</h2>
            <pre className="stack-trace">
              <code>{error.stack_trace}</code>
            </pre>
          </section>
        )}

        <div className="detail-grid">
          <section className="request-section">
            <h2>Request Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">URL</span>
                <span className="info-value">{error.request_url || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Method</span>
                <span className="info-value">{error.request_method || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">IP Address</span>
                <span className="info-value">{error.ip_address || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">User</span>
                <span className="info-value">{error.user_id || 'Anonymous'}</span>
              </div>
            </div>
          </section>

          <section className="params-section">
            <h2>Request Parameters</h2>
            {error.request_params ? (
              <pre className="code-block">
                <code>{JSON.stringify(error.request_params, null, 2)}</code>
              </pre>
            ) : (
              <p className="empty-text">No request parameters</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ErrorDetail;