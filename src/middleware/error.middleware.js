const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const env = require('../config/env');

/**
 * Custom error class for operational errors
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle Mongoose duplicate key error
 */
const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    return new AppError(message, HTTP_STATUS.CONFLICT);
};

/**
 * Handle Mongoose validation error
 */
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Validation failed: ${errors.join('. ')}`;
    return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);

const handleJWTExpiredError = () => new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        error: err,
        stack: err.stack
    });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    } else {
        // Programming or unknown error: don't leak error details
        console.error('ERROR 💥:', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR
        });
    }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    err.message = err.message || ERROR_MESSAGES.INTERNAL_ERROR;

    if (env.isDev) {
        sendErrorDev(err, res);
    } else {
        let error = { ...err, message: err.message };

        if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (err.code === 11000) error = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
    const err = new AppError(`Cannot find ${req.originalUrl} on this server`, HTTP_STATUS.NOT_FOUND);
    next(err);
};

/**
 * Async handler wrapper to catch errors in async functions
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    AppError,
    errorHandler,
    notFoundHandler,
    asyncHandler
};
