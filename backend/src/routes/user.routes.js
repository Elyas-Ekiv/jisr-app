const express = require('express');
const controller = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const validation = require('../validations/user.validation');

const router = express.Router();

router.use(authenticate);

// Admin-only: Get all users
router.get('/', requireAdmin, controller.getAllUsers);

// Check if email exists (MUST be before /:id to avoid route conflict)
router.get('/check-email', controller.checkEmail);

// Get user by ID (own profile or admin)
router.get('/:id', controller.getUser);

// Update user (own profile or admin)
router.put('/:id', validation.updateValidation, validate, controller.updateUser);

// Admin-only: Delete user
router.delete('/:id', requireAdmin, controller.deleteUser);

module.exports = router;

