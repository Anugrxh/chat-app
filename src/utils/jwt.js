const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate access token for a user
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} JWT access token
 */
const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId, type: 'access' },
        env.JWT_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );
};

/**
 * Generate refresh token for a user
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        env.JWT_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );
};

/**
 * Verify and decode access token
 * @param {string} token - JWT access token
 * @returns {object|null} Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (decoded.type !== 'access') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
};

/**
 * Verify and decode refresh token
 * @param {string} token - JWT refresh token
 * @returns {object|null} Decoded token payload or null if invalid
 */
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (decoded.type !== 'refresh') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
};

/**
 * Generate both access and refresh tokens
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {object} Object containing accessToken and refreshToken
 */
const generateTokenPair = (userId) => {
    return {
        accessToken: generateAccessToken(userId),
        refreshToken: generateRefreshToken(userId)
    };
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateTokenPair
};
