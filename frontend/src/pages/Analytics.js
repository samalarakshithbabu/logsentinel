import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [summaryRes, timelineRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getTimeline({ days: 30 })
      ]);
      setSummary(summaryRes.data);
      setTimeline(timelineRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  const errorsByTypeData = {
    labels: ['Critical', 'High', 'Medium', 'Low', 'Info'],
    datasets: [{
      label: 'Errors by Type',
      data: [
        summary?.byType?.critical || 0,
        summary?.byType?.high || 0,
        summary?.byType?.medium || 0,
        summary?.byType?.low || 0,
        summary?.byType?.info || 0
      ],
      backgroundColor: [
        '#dc2626',
        '#ea580c',
        '#ca8a04',
        '#16a34a',
        '#3b82f6'
      ]
    }]
  };

  const timelineData = {
    labels: timeline?.labels || [],
    datasets: [{
      label: 'Errors',
      data: timeline?.data || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div className="analytics-page">
      <h1>Analytics</h1>

      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Total Errors</h3>
          <div className="summary-value">{summary?.total || 0}</div>
        </div>
        <div className="summary-card">
          <h3>Critical</h3>
          <div className="summary-value critical">{summary?.critical || 0}</div>
        </div>
        <div className="summary-card">
          <h3>Resolved</h3>
          <div className="summary-value resolved">{summary?.resolved || 0}</div>
        </div>
        <div className="summary-card">
          <h3>Resolution Rate</h3>
          <div className="summary-value">
            {summary?.total > 0 
              ? Math.round((summary?.resolved / summary?.total) * 100)
              : 0}%
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Errors by Type</h3>
          <div className="chart-container">
            <Doughnut data={errorsByTypeData} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Error Timeline (Last 30 Days)</h3>
          <div className="chart-container">
            <Line data={timelineData} />
          </div>
        </div>
      </div>

      <div className="export-section">
        <h3>Export Data</h3>
        <div className="export-buttons">
          <button onClick={() => analyticsAPI.exportData('json')} className="btn-secondary">
            Export as JSON
          </button>
          <button onClick={() => analyticsAPI.exportData('csv')} className="btn-secondary">
            Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;