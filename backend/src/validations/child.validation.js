const { body, param } = require('express-validator');

const createValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('age')
    .optional()
    .isInt({ min: 0, max: 18 })
    .withMessage('Age must be between 0 and 18'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),

  body('pin')
    .notEmpty()
    .withMessage('PIN is required')
    .matches(/^\d{4}$/)
    .withMessage('PIN must be exactly 4 digits'),
];

const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('age')
    .optional()
    .isInt({ min: 0, max: 18 })
    .withMessage('Age must be between 0 and 18'),

  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),

  body('pin')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('PIN must be exactly 4 digits'),
];

module.exports = {
  createValidation,
  updateValidation,
};

