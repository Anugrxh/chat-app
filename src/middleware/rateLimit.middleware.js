const { rateLimit } = require('express-rate-limit');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Rate limiter for authentication endpoints
 * Limits: 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: {
        success: false,
        message: ERROR_MESSAGES.TOO_MANY_REQUESTS
    },
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false // Disable X-RateLimit-* headers
    // Use default keyGenerator which handles IPv6 properly
});

/**
 * Rate limiter for OTP verification attempts
 * Limits: 5 requests per 15 minutes per IP
 */
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        message: ERROR_MESSAGES.TOO_MANY_REQUESTS
    },
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: ERROR_MESSAGES.TOO_MANY_REQUESTS
    },
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    authLimiter,
    otpLimiter,
    apiLimiter
};
