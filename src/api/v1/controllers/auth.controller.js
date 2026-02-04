const authService = require('../services/auth.service');
const { asyncHandler } = require('../../../middleware/error.middleware');
const { successResponse } = require('../../../utils/response');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../../../utils/constants');

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

    const result = await authService.verifySignupOTP(email, otp);

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
