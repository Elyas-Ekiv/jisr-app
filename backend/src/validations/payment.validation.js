const { body } = require('express-validator');

/**
 * Create payment session validation
 */
const createPaymentValidation = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isString()
    .withMessage('Plan ID must be a string'),
  
  body('discountCode')
    .optional()
    .isString()
    .withMessage('Discount code must be a string'),
];

/**
 * Verify payment validation
 */
const verifyPaymentValidation = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isString()
    .withMessage('Session ID must be a string'),
];

module.exports = {
  createPaymentValidation,
  verifyPaymentValidation,
};

