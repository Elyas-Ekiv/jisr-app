const { AppError } = require('./error.middleware');

/**
 * Factory that returns a middleware blocking access when the user has
 * a given feature restriction set by an admin.
 * Must be placed AFTER the `authenticate` middleware.
 *
 * Usage: router.post('/', authenticate, requireFeature('children'), controller.create)
 */
const requireFeature = (feature) => (req, res, next) => {
  const restrictions = req.user?.restrictions ?? [];
  if (restrictions.includes(feature)) {
    return next(
      new AppError(
        'Access to this feature has been restricted by the administrator. Please contact support.',
        403
      )
    );
  }
  next();
};

module.exports = { requireFeature };
