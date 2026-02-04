const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { signupValidator, verifyOtpValidator, resendOtpValidator } = require('../validators/auth.validator');
const { authLimiter, otpLimiter } = require('../../../middleware/rateLimit.middleware');

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Initiate user signup - sends OTP to email
 * @access  Public
 */
router.post(
    '/signup',
    authLimiter,
    signupValidator,
    authController.signup
);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and complete signup
 * @access  Public
 */
router.post(
    '/verify-otp',
    otpLimiter,
    verifyOtpValidator,
    authController.verifyOTP
);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend OTP to email
 * @access  Public
 */
router.post(
    '/resend-otp',
    otpLimiter,
    resendOtpValidator,
    authController.resendOTP
);

module.exports = router;
