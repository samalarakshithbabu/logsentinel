import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { errorLogsAPI } from '../services/api';
import { format } from 'date-fns';

const ErrorLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    error_type: '',
    search: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      };
      const response = await errorLogsAPI.list(params);
      setLogs(response.data.logs);
      setPagination(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (err) {
      console.error('Failed to fetch error logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="error-logs-page">
      <div className="page-header">
        <h1>Error Logs</h1>
        <Link to="/errors/new" className="btn-primary">
          Create Error Log
        </Link>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search errors..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="search-input"
        />
        <select
          value={filters.error_type}
          onChange={(e) => handleFilterChange('error_type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="ignored">Ignored</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading error logs...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">No error logs found</div>
      ) : (
        <>
          <div className="error-table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Error Code</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span className={`badge ${log.error_type}`}>
                        {log.error_type}
                      </span>
                    </td>
                    <td>{log.error_code}</td>
                    <td>
                      <Link to={`/errors/${log.id}`}>
                        {log.message?.substring(0, 100)}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${log.status}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ErrorLogs;