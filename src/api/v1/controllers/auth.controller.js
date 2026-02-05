const crypto = require('crypto');
const authService = require('../services/auth.service');
const { asyncHandler } = require('../../../middleware/error.middleware');
const { successResponse } = require('../../../utils/response');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../../../utils/constants');

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

/**
 * @desc    Login with email and password
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const result = await authService.login(email, password, deviceInfo);

    return successResponse(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS, HTTP_STATUS.OK);
});

/**
 * @desc    Google OAuth callback handler
 * @route   GET /api/v1/auth/google/callback
 * @access  Public
 */
const googleCallback = asyncHandler(async (req, res) => {
    const deviceInfo = getDeviceInfo(req);

    // req.user is set by passport after successful authentication
    const result = await authService.googleOAuthLogin(req.user, deviceInfo);

    // For web clients, redirect with tokens in query params
    // In production, you might want to set tokens in cookies or redirect to frontend
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?` +
        `accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;

    res.redirect(redirectUrl);
});

/**
 * @desc    Google OAuth callback for API clients (returns JSON)
 * @route   GET /api/v1/auth/google/callback/json
 * @access  Public
 */
const googleCallbackJson = asyncHandler(async (req, res) => {
    const deviceInfo = getDeviceInfo(req);

    const result = await authService.googleOAuthLogin(req.user, deviceInfo);

    return successResponse(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS, HTTP_STATUS.OK);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const result = await authService.refreshAccessToken(refreshToken, deviceInfo);

    return successResponse(res, result, SUCCESS_MESSAGES.TOKEN_REFRESHED, HTTP_STATUS.OK);
});

/**
 * @desc    Logout from current device
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    const deviceInfo = getDeviceInfo(req);

    const result = await authService.logout(req.user._id, deviceInfo.deviceId);

    return successResponse(res, result, result.message, HTTP_STATUS.OK);
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/v1/auth/logout-all
 * @access  Private
 */
const logoutAll = asyncHandler(async (req, res) => {
    const result = await authService.logoutAllDevices(req.user._id);

    return successResponse(res, result, result.message, HTTP_STATUS.OK);
});

/**
 * @desc    Get active sessions
 * @route   GET /api/v1/auth/sessions
 * @access  Private
 */
const getSessions = asyncHandler(async (req, res) => {
    const sessions = await authService.getActiveSessions(req.user._id);

    return successResponse(res, { sessions }, 'Active sessions retrieved', HTTP_STATUS.OK);
});

module.exports = {
    signup,
    verifyOTP,
    resendOTP,
    login,
    googleCallback,
    googleCallbackJson,
    refreshToken,
    logout,
    logoutAll,
    getSessions
};
