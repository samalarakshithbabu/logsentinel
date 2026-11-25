import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : date;
    return format(date, 'MMM d, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format relative time
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : date;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Format error severity for display
 */
export const formatSeverity = (severity) => {
  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info'
  };
  return labels[severity?.toLowerCase()] || severity;
};

/**
 * Format status for display
 */
export const formatStatus = (status) => {
  const labels = {
    new: 'New',
    investigating: 'Investigating',
    resolved: 'Resolved',
    ignored: 'Ignored'
  };
  return labels[status?.toLowerCase()] || status;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * Get severity color class
 */
export const getSeverityColor = (severity) => {
  const colors = {
    critical: 'danger',
    high: 'warning',
    medium: 'medium',
    low: 'success',
    info: 'info'
  };
  return colors[severity?.toLowerCase()] || 'info';
};

/**
 * Get status color class
 */
export const getStatusColor = (status) => {
  const colors = {
    new: 'info',
    investigating: 'warning',
    resolved: 'success',
    ignored: 'low'
  };
  return colors[status?.toLowerCase()] || 'info';
};