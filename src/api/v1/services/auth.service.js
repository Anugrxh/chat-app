const bcrypt = require('bcryptjs');
const { User, Otp, RefreshToken } = require('../../../models');
const { generateOTP } = require('../../../utils/otp');
const { generateTokenPair } = require('../../../utils/jwt');
const { AppError } = require('../../../middleware/error.middleware');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, OTP_PURPOSE } = require('../../../utils/constants');
const env = require('../../../config/env');
const { sendOTPEmail } = require('./email.service');

/**
 * Check if an email is already registered
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const isEmailTaken = async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
};

/**
 * Check if a username is already taken
 * @param {string} username
 * @returns {Promise<boolean>}
 */
const isUsernameTaken = async (username) => {
    const user = await User.findOne({ username: username.toLowerCase() });
    return !!user;
};

/**
 * Parse user agent to get device name
 * @param {string} userAgent
 * @returns {object} { name, type }
 */
const parseUserAgent = (userAgent) => {
    if (!userAgent) return { name: 'Unknown Device', type: 'unknown' };

    let name = 'Unknown Device';
    let type = 'unknown';

    // Detect browser
    if (userAgent.includes('Chrome')) name = 'Chrome';
    else if (userAgent.includes('Firefox')) name = 'Firefox';
    else if (userAgent.includes('Safari')) name = 'Safari';
    else if (userAgent.includes('Edge')) name = 'Edge';
    else if (userAgent.includes('Opera')) name = 'Opera';

    // Detect OS and type
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        name += ' on iOS';
        type = 'mobile';
    } else if (userAgent.includes('Android')) {
        name += ' on Android';
        type = 'mobile';
    } else if (userAgent.includes('Windows')) {
        name += ' on Windows';
        type = 'desktop';
    } else if (userAgent.includes('Mac')) {
        name += ' on macOS';
        type = 'desktop';
    } else if (userAgent.includes('Linux')) {
        name += ' on Linux';
        type = 'desktop';
    }

    // Check for mobile apps or Postman
    if (userAgent.includes('Postman')) {
        name = 'Postman';
        type = 'api-client';
    }

    return { name, type };
};

/**
 * Store refresh token with device info
 * @param {string} userId
 * @param {string} refreshToken
 * @param {object} deviceInfo - { deviceId, userAgent, ip }
 */
const storeRefreshToken = async (userId, refreshToken, deviceInfo) => {
    const { deviceId, userAgent, ip } = deviceInfo;
    const { name, type } = parseUserAgent(userAgent);

    // Calculate expiry (7 days default)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Remove existing token for this device (one token per device)
    await RefreshToken.deleteMany({ userId, deviceId });

    // Create new refresh token record
    await RefreshToken.create({
        userId,
        token: refreshToken,
        deviceId,
        deviceInfo: {
            name,
            type,
            userAgent,
            ip
        },
        expiresAt
    });
};

/**
 * Initiate signup process - validates input and sends OTP
 * @param {object} signupData - { email, username, fullname, password }
 * @returns {Promise<object>} - { message, email }
 */
const initiateSignup = async ({ email, username, fullname, password }) => {
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    // Check if user already exists
    if (await isEmailTaken(normalizedEmail)) {
        throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    if (await isUsernameTaken(normalizedUsername)) {
        throw new AppError(ERROR_MESSAGES.USERNAME_TAKEN, HTTP_STATUS.CONFLICT);
    }

    // Check for existing pending signup OTP
    const existingOtp = await Otp.findOne({
        email: normalizedEmail,
        purpose: OTP_PURPOSE.SIGNUP
    });

    // If there's a recent OTP (less than 1 minute old), don't send a new one
    if (existingOtp) {
        const timeSinceCreation = Date.now() - existingOtp.createdAt.getTime();
        if (timeSinceCreation < 60000) { // 1 minute
            throw new AppError('Please wait before requesting a new OTP', HTTP_STATUS.TOO_MANY_REQUESTS);
        }
        // Delete old OTP
        await Otp.deleteOne({ _id: existingOtp._id });
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

    // Create OTP record with pending user data
    await Otp.create({
        email: normalizedEmail,
        otp,
        purpose: OTP_PURPOSE.SIGNUP,
        expiresAt,
        pendingUserData: {
            username: normalizedUsername,
            fullname,
            password: hashedPassword
        }
    });

    // Send OTP email
    await sendOTPEmail(normalizedEmail, otp, OTP_PURPOSE.SIGNUP);

    return {
        message: SUCCESS_MESSAGES.SIGNUP_INITIATED,
        email: normalizedEmail
    };
};

/**
 * Verify OTP and complete signup
 * @param {string} email
 * @param {string} otp
 * @param {object} deviceInfo - { deviceId, userAgent, ip }
 * @returns {Promise<object>} - { user, accessToken, refreshToken }
 */
const verifySignupOTP = async (email, otp, deviceInfo) => {
    const normalizedEmail = email.toLowerCase();

    // Find the OTP record with pending user data
    const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        purpose: OTP_PURPOSE.SIGNUP
    }).select('+pendingUserData');

    if (!otpRecord) {
        throw new AppError(ERROR_MESSAGES.OTP_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
        await Otp.deleteOne({ _id: otpRecord._id });
        throw new AppError(ERROR_MESSAGES.OTP_EXPIRED, HTTP_STATUS.BAD_REQUEST);
    }

    // Check max attempts
    if (otpRecord.attempts >= env.OTP_MAX_ATTEMPTS) {
        await Otp.deleteOne({ _id: otpRecord._id });
        throw new AppError(ERROR_MESSAGES.OTP_MAX_ATTEMPTS, HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    // Verify OTP
    const isValidOtp = await otpRecord.compareOtp(otp);
    if (!isValidOtp) {
        // Increment attempts
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new AppError(ERROR_MESSAGES.OTP_INVALID, HTTP_STATUS.BAD_REQUEST);
    }

    // Check for pending user data
    if (!otpRecord.pendingUserData) {
        throw new AppError('Signup data not found. Please restart the signup process.', HTTP_STATUS.BAD_REQUEST);
    }

    // Double check email and username aren't taken (race condition protection)
    if (await isEmailTaken(normalizedEmail)) {
        await Otp.deleteOne({ _id: otpRecord._id });
        throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    if (await isUsernameTaken(otpRecord.pendingUserData.username)) {
        await Otp.deleteOne({ _id: otpRecord._id });
        throw new AppError(ERROR_MESSAGES.USERNAME_TAKEN, HTTP_STATUS.CONFLICT);
    }

    // Create the user
    const user = await User.create({
        email: normalizedEmail,
        username: otpRecord.pendingUserData.username,
        fullname: otpRecord.pendingUserData.fullname,
        password: otpRecord.pendingUserData.password,
        isEmailVerified: true
    });

    // Delete the OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id);

    // Store refresh token with device info
    await storeRefreshToken(user._id, refreshToken, deviceInfo);

    // Return user data (without password)
    const userResponse = {
        id: user._id,
        email: user.email,
        username: user.username,
        fullname: user.fullname,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
    };

    return {
        user: userResponse,
        accessToken,
        refreshToken
    };
};

/**
 * Resend OTP for pending signup
 * @param {string} email
 * @returns {Promise<object>} - { message, email }
 */
const resendSignupOTP = async (email) => {
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    if (await isEmailTaken(normalizedEmail)) {
        throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    // Find existing OTP record
    const existingOtp = await Otp.findOne({
        email: normalizedEmail,
        purpose: OTP_PURPOSE.SIGNUP
    }).select('+pendingUserData');

    if (!existingOtp || !existingOtp.pendingUserData) {
        throw new AppError(ERROR_MESSAGES.OTP_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if we can resend (rate limit: 1 minute between resends)
    const timeSinceCreation = Date.now() - existingOtp.createdAt.getTime();
    if (timeSinceCreation < 60000) {
        const waitSeconds = Math.ceil((60000 - timeSinceCreation) / 1000);
        throw new AppError(`Please wait ${waitSeconds} seconds before requesting a new OTP`, HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    // Generate new OTP
    const otp = generateOTP();

    // Calculate new expiry time
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

    // Update OTP record
    existingOtp.otp = otp;
    existingOtp.expiresAt = expiresAt;
    existingOtp.attempts = 0;
    await existingOtp.save();

    // Send OTP email
    await sendOTPEmail(normalizedEmail, otp, OTP_PURPOSE.SIGNUP);

    return {
        message: SUCCESS_MESSAGES.OTP_RESENT,
        email: normalizedEmail
    };
};

module.exports = {
    initiateSignup,
    verifySignupOTP,
    resendSignupOTP
};
