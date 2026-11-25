const { body, query, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

const createLogValidation = [
  body('level').isIn(['critical', 'high', 'medium', 'low', 'info']).withMessage('Invalid severity level'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('route').optional().trim(),
  body('stack').optional().trim(),
  body('projectId').optional().isInt(),
  handleValidationErrors
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = { 
  handleValidationErrors, 
  createLogValidation,
  paginationValidation 
};