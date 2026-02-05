// Centralized environment configuration with validation
require('dotenv').config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

// Validate required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}

const env = {
    // Server
    PORT: parseInt(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',

    // Database
    MONGO_URI: process.env.MONGO_URI,

    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // SMTP
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM || 'noreply@chatapp.com',

    // OTP
    OTP_EXPIRES_IN_MINUTES: parseInt(process.env.OTP_EXPIRES_IN_MINUTES) || 10,
    OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS) || 3,

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback'
};

module.exports = env;
