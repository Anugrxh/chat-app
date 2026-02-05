const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const { AppError } = require('./error.middleware');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Authentication middleware - verifies JWT access token
 * Attaches user to req.user if token is valid
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
        }

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Optional authentication middleware - attaches user if token is valid, but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = verifyAccessToken(token);

        if (decoded) {
            const user = await User.findById(decoded.userId);
            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Silently continue without auth
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth
};
