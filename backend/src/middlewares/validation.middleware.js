const { validationResult } = require('express-validator');
const { AppError } = require('./error.middleware');

/**
 * Validate request - checks express-validator results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return next(new AppError('Validation failed', 400, errorMessages));
  }
  
  next();
};

module.exports = {
  validate,
};

