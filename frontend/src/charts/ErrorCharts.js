import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SEVERITY_COLORS = {
  critical: '#dc3545',
  high: '#fd7e14',
  medium: '#ffc107',
  low: '#0d6efd',
  info: '#20c997'
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'];

export const HourlyErrorsChart = ({ data, height = 300 }) => {
  if (!data?.labels?.length) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-muted">No data available</p>
      </div>
    );
  }

  const datasets = SEVERITY_ORDER.map(severity => ({
    label: severity.charAt(0).toUpperCase() + severity.slice(1),
    data: data.datasets?.[severity] || [],
    borderColor: SEVERITY_COLORS[severity],
    backgroundColor: `${SEVERITY_COLORS[severity]}20`,
    fill: true,
    tension: 0.4
  }));

  const chartData = {
    labels: data.labels.map(l => l.split(' ')[1]?.slice(0, 5) || l),
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export const DailyErrorsChart = ({ data, height = 300 }) => {
  if (!data?.labels?.length) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-muted">No data available</p>
      </div>
    );
  }

  const datasets = SEVERITY_ORDER.map(severity => ({
    label: severity.charAt(0).toUpperCase() + severity.slice(1),
    data: data.datasets?.[severity] || [],
    backgroundColor: SEVERITY_COLORS[severity]
  }));

  const chartData = {
    labels: data.labels.map(l => {
      const d = new Date(l);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }),
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: false
      }
    }
  };

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const SeverityDistributionChart = ({ data, height = 250 }) => {
  if (!data?.distribution?.length) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-muted">No data available</p>
      </div>
    );
  }

  const sortedData = SEVERITY_ORDER
    .map(severity => data.distribution.find(d => d.error_type === severity))
    .filter(Boolean);

  const chartData = {
    labels: sortedData.map(d => d.error_type.toUpperCase()),
    datasets: [{
      data: sortedData.map(d => d.count),
      backgroundColor: sortedData.map(d => SEVERITY_COLORS[d.error_type]),
      borderWidth: 0
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export const RouteErrorsChart = ({ data, height = 300 }) => {
  if (!data?.routes?.length) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-muted">No data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.routes.slice(0, 10).map(r => r.route?.slice(0, 30) || 'Unknown'),
    datasets: [{
      label: 'Error Count',
      data: data.routes.slice(0, 10).map(r => r.count),
      backgroundColor: '#0d6efd'
    }]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  };

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default {
  HourlyErrorsChart,
  DailyErrorsChart,
  SeverityDistributionChart,
  RouteErrorsChart
};