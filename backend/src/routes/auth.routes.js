const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  childLoginValidation,
  recoveryQuestionLookupValidation,
  resetPasswordRecoveryValidation,
} = require('../validations/auth.validation');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', authLimiter, registerValidation, validate, authController.register);

/**
 * @route   POST /api/auth/recovery-question
 * @desc    Get security question for an email (null if unavailable)
 */
router.post(
  '/recovery-question',
  authLimiter,
  recoveryQuestionLookupValidation,
  validate,
  authController.recoveryQuestion
);

/**
 * @route   POST /api/auth/reset-password-recovery
 * @desc    Reset password using security answer
 */
router.post(
  '/reset-password-recovery',
  authLimiter,
  resetPasswordRecoveryValidation,
  validate,
  authController.resetPasswordRecovery
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, loginValidation, validate, authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshTokenValidation, validate, authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/auth/child-login
 * @desc    Child login with username + PIN
 * @access  Public
 */
router.post('/child-login', authLimiter, childLoginValidation, validate, authController.childLogin);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;

