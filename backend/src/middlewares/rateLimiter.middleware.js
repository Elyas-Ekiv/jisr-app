const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const isDev = config.nodeEnv !== 'production';

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: isDev ? 10_000 : config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints (very tight in production; relaxed locally)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Payment endpoint rate limiter
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 200 : 10,
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter,
};

