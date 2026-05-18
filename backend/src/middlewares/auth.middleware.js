const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/db');
const { AppError } = require('./error.middleware');

/**
 * Verify JWT access token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountType: true,
        emailVerified: true,
        blocked: true,
        restrictions: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (user.blocked) {
      throw new AppError(
        'Your account has been suspended. Please contact support.',
        403
      );
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(error);
  }
};

/**
 * Check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
};

