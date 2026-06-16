const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const isDev = config.nodeEnv === 'development';

/** No-op middleware used when rate limiting is disabled in development */
const skipLimiter = (_req, _res, next) => next();

/**
 * General API rate limiter
 */
const apiLimiter = isDev
  ? skipLimiter
  : rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMaxRequests,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

/**
 * Rate limiter for auth endpoints
 */
const authLimiter = isDev
  ? skipLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: config.rateLimitAuthMaxRequests,
      message: 'Too many login attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

/**
 * Payment endpoint rate limiter
 */
const paymentLimiter = isDev
  ? skipLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: config.rateLimitPaymentMaxRequests,
      message: 'Too many payment requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter,
};
