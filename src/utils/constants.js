// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
};

// Error Messages
const ERROR_MESSAGES = {
    // Validation
    VALIDATION_ERROR: 'Validation failed',
    INVALID_INPUT: 'Invalid input provided',

    // Authentication
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Authentication required',
    TOKEN_EXPIRED: 'Token has expired',
    INVALID_TOKEN: 'Invalid token',
    INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
    OAUTH_ONLY_ACCOUNT: 'This account uses Google login. Please sign in with Google.',

    // User
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User with this email already exists',
    USERNAME_TAKEN: 'Username is already taken',
    EMAIL_NOT_VERIFIED: 'Email not verified. Please verify your email first.',

    // OTP
    OTP_SENT: 'OTP sent to your email',
    OTP_INVALID: 'Invalid or expired OTP',
    OTP_EXPIRED: 'OTP has expired',
    OTP_MAX_ATTEMPTS: 'Maximum OTP attempts exceeded. Please request a new OTP',
    OTP_NOT_FOUND: 'No pending verification found for this email',

    // Rate Limiting
    TOO_MANY_REQUESTS: 'Too many requests. Please try again later',

    // Server
    INTERNAL_ERROR: 'An unexpected error occurred',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
};

// Success Messages
const SUCCESS_MESSAGES = {
    SIGNUP_INITIATED: 'Signup initiated. Please verify your email with the OTP sent',
    OTP_VERIFIED: 'Email verified successfully',
    USER_CREATED: 'Account created successfully',
    OTP_RESENT: 'OTP has been resent to your email',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    LOGOUT_ALL_SUCCESS: 'Logged out from all devices',
    TOKEN_REFRESHED: 'Token refreshed successfully'
};

// OTP Purposes
const OTP_PURPOSE = {
    SIGNUP: 'verification',
    LOGIN: 'login',
    PASSWORD_RESET: 'password_reset'
};

module.exports = {
    HTTP_STATUS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    OTP_PURPOSE
};
