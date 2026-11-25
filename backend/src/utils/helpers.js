/**
 * Utility helper functions
 */

/**
 * Generate a random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate API key
 */
const generateApiKey = (prefix = 'pk') => {
  const timestamp = Date.now().toString(36);
  const random = generateRandomString(16);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
const retry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }
  throw lastError;
};

/**
 * Sanitize object for logging (remove sensitive data)
 */
const sanitizeForLogging = (obj) => {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = sensitiveKeys.some(sk => key.toLowerCase().includes(sk));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Parse user agent string
 */
const parseUserAgent = (userAgent) => {
  if (!userAgent) return { browser: 'Unknown', os: 'Unknown' };
  
  const ua = userAgent.toLowerCase();
  
  let browser = 'Unknown';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  return { browser, os };
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Paginate array
 */
const paginate = (array, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit
    }
  };
};

module.exports = {
  generateRandomString,
  generateApiKey,
  sleep,
  retry,
  sanitizeForLogging,
  parseUserAgent,
  isValidEmail,
  paginate
};