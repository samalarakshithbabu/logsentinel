const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');

/**
 * @route   GET /api/users
 * @desc    List all users
 * @access  Private (Admin)
 */
router.get('/', userController.list);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', userController.getOne);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or Self)
 */
router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('role').optional().isIn(['admin', 'developer', 'viewer'])
], userController.update);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/:id', userController.delete);

/**
 * @route   GET /api/users/:id/projects
 * @desc    Get user's projects
 * @access  Private
 */
router.get('/:id/projects', userController.getProjects);

module.exports = router;