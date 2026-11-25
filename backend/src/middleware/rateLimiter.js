const rateLimit = require('express-rate-limit');
const config = require('../config');

const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.maxRequests,
    message: { 
      message: 'Too many requests, please try again later.' 
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

const apiLimiter = createRateLimiter();
const authLimiter = createRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 });

module.exports = { createRateLimiter, apiLimiter, authLimiter };