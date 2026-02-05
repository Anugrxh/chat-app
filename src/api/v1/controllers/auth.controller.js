const crypto = require('crypto');
const authService = require('../services/auth.service');
const { asyncHandler } = require('../../../middleware/error.middleware');
const { successResponse, errorResponse } = require('../../../utils/response');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../../../utils/constants');

/**
 * Extract device info from request headers
 * @param {object} req - Express request object
 * @returns {object} { deviceId, userAgent, ip }
 */
const getDeviceInfo = (req) => {
    // Get device ID from header or generate one
    let deviceId = req.headers['x-device-id'];

    // If no device ID provided, generate a temporary one based on IP + User-Agent
    if (!deviceId) {
        const fingerprint = `${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
        deviceId = crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 32);
    }

    return {
        deviceId,
        userAgent: req.headers['user-agent'] || '',
        ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || ''
    };
};

/**
 * @desc    Initiate user signup - sends OTP to email
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
    const { email, username, fullname, password } = req.body;

    const result = await authService.initiateSignup({
        email,
        username,
        fullname,
        password
    });

    return successResponse(res, result, result.message, HTTP_STATUS.OK);
});

/**
 * @desc    Verify OTP and complete signup
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const result = await authService.verifySignupOTP(email, otp, deviceInfo);

    return successResponse(res, result, SUCCESS_MESSAGES.USER_CREATED, HTTP_STATUS.CREATED);
});

/**
 * @desc    Resend OTP to email
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await authService.resendSignupOTP(email);

    return successResponse(res, result, result.message, HTTP_STATUS.OK);
});

module.exports = {
    signup,
    verifyOTP,
    resendOTP
};
