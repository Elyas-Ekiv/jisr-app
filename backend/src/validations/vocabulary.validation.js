const { body, param } = require('express-validator');

const createValidation = [
  body('text')
    .notEmpty()
    .withMessage('Text is required')
    .custom((value) => {
      if (typeof value !== 'object') {
        throw new Error('Text must be an object with en and/or ar properties');
      }
      if (!value.en && !value.ar) {
        throw new Error('Text must have at least en or ar property');
      }
      return true;
    }),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  
  body('level')
    .optional()
    .isIn(['BASIC', 'INTERMEDIATE', 'ADVANCED'])
    .withMessage('Level must be BASIC, INTERMEDIATE, or ADVANCED'),
  
  body('imageUrl')
    .optional()
    .custom((value) => {
      if (!value) return true;
      // Allow base64 data URIs, plain URLs, or emoji/short strings
      if (value.startsWith('data:image/')) return true;
      if (value.length <= 10) return true; // emoji or short code
      try { new URL(value); return true; } catch {
        throw new Error('imageUrl must be a valid URL or base64 data URI');
      }
    }),

  body('audioUrl')
    .optional()
    .isURL()
    .withMessage('Audio URL must be a valid URL'),

  body('locations')
    .optional()
    .isArray()
    .withMessage('Locations must be an array of location IDs')
    .custom((value) => {
      if (!Array.isArray(value)) return true;
      if (!value.every((id) => typeof id === 'string' && id.length > 0)) {
        throw new Error('Each location must be a non-empty string ID');
      }
      return true;
    }),
];

const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required'),
  
  body('text')
    .optional()
    .custom((value) => {
      if (value && typeof value !== 'object') {
        throw new Error('Text must be an object');
      }
      return true;
    }),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  
  body('level')
    .optional()
    .isIn(['BASIC', 'INTERMEDIATE', 'ADVANCED'])
    .withMessage('Level must be BASIC, INTERMEDIATE, or ADVANCED'),

  body('locations')
    .optional()
    .isArray()
    .withMessage('Locations must be an array of location IDs')
    .custom((value) => {
      if (!Array.isArray(value)) return true;
      if (!value.every((id) => typeof id === 'string' && id.length > 0)) {
        throw new Error('Each location must be a non-empty string ID');
      }
      return true;
    }),
];

const assignValidation = [
  param('id')
    .notEmpty()
    .withMessage('Vocabulary ID is required'),
  
  body('childId')
    .notEmpty()
    .withMessage('Child ID is required'),
];

module.exports = {
  createValidation,
  updateValidation,
  assignValidation,
};

