const { body, param } = require('express-validator');

const updateValidation = [
  param('childId')
    .notEmpty()
    .withMessage('Child ID is required'),
  
  body('primaryLanguage')
    .optional()
    .isIn(['en', 'ar', 'en-ar'])
    .withMessage('Primary language must be en, ar, or en-ar'),
  
  body('secondaryLanguage')
    .optional()
    .isIn(['en', 'ar'])
    .withMessage('Secondary language must be en or ar'),
  
  body('voiceType')
    .optional()
    .isIn(['child', 'adult', 'neutral'])
    .withMessage('Voice type must be child, adult, or neutral'),
  
  body('speechSpeed')
    .optional()
    .isFloat({ min: 0.5, max: 2.0 })
    .withMessage('Speech speed must be between 0.5 and 2.0'),
  
  body('volume')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Volume must be between 0 and 1'),
  
  body('maxSentenceLength')
    .optional()
    .isInt({ min: 3, max: 20 })
    .withMessage('Max sentence length must be between 3 and 20'),
  
  body('visibleImageCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Visible image count must be 0 or greater'),
  
  body('vocabularyLevel')
    .optional()
    .isIn(['BASIC', 'INTERMEDIATE', 'ADVANCED'])
    .withMessage('Vocabulary level must be BASIC, INTERMEDIATE, or ADVANCED'),
  
  body('speechMode')
    .optional()
    .isIn(['INSTANT', 'SENTENCE'])
    .withMessage('Speech mode must be INSTANT or SENTENCE'),
];

module.exports = {
  updateValidation,
};

