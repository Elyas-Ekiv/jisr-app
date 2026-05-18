const { body } = require('express-validator');

/**
 * Register validation rules
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('accountType')
    .optional()
    .isIn(['parent', 'admin'])
    .withMessage('Invalid account type'),

  body('recoveryQuestion')
    .trim()
    .notEmpty()
    .withMessage('Security question is required')
    .isLength({ max: 200 })
    .withMessage('Question is too long'),

  body('recoveryAnswer')
    .trim()
    .notEmpty()
    .withMessage('Security answer is required')
    .isLength({ min: 2, max: 128 })
    .withMessage('Answer must be between 2 and 128 characters'),
];

const recoveryQuestionLookupValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

const resetPasswordRecoveryValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('recoveryAnswer').trim().notEmpty().withMessage('Security answer is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Refresh token validation
 */
const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

/**
 * Child login validation rules
 */
const childLoginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),

  body('pin')
    .notEmpty()
    .withMessage('PIN is required')
    .matches(/^\d{4}$/)
    .withMessage('PIN must be exactly 4 digits'),
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  childLoginValidation,
  recoveryQuestionLookupValidation,
  resetPasswordRecoveryValidation,
};

