const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {
    signupValidator,
    verifyOtpValidator,
    resendOtpValidator,
    loginValidator,
    refreshTokenValidator
} = require('../validators/auth.validator');
const { authLimiter, otpLimiter } = require('../../../middleware/rateLimit.middleware');
const { authenticate } = require('../../../middleware/auth.middleware');

// =====================
// SIGNUP ROUTES
// =====================

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Initiate signup - sends OTP to email
 * @access  Public
 */
router.post('/signup', authLimiter, signupValidator, authController.signup);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and complete signup
 * @access  Public
 */
router.post('/verify-otp', otpLimiter, verifyOtpValidator, authController.verifyOTP);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend OTP to email
 * @access  Public
 */
router.post('/resend-otp', authLimiter, resendOtpValidator, authController.resendOTP);

// =====================
// LOGIN ROUTES
// =====================

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', authLimiter, loginValidator, authController.login);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback (redirects to frontend)
 * @access  Public
 */
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/api/v1/auth/google/failure'
    }),
    authController.googleCallback
);

/**
 * @route   GET /api/v1/auth/google/callback/json
 * @desc    Google OAuth callback (returns JSON for API clients)
 * @access  Public
 */
router.get('/google/callback/json',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/api/v1/auth/google/failure'
    }),
    authController.googleCallbackJson
);

/**
 * @route   GET /api/v1/auth/google/failure
 * @desc    Google OAuth failure handler
 * @access  Public
 */
router.get('/google/failure', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Google authentication failed'
    });
});

// =====================
// TOKEN MANAGEMENT ROUTES
// =====================

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh-token', refreshTokenValidator, authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout from current device
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get active sessions/devices
 * @access  Private
 */
router.get('/sessions', authenticate, authController.getSessions);

module.exports = router;
