const crypto = require('crypto');

/**
 * Generate a cryptographically secure OTP
 * @param {number} length - Length of the OTP (default: 6)
 * @returns {string} Generated OTP
 */
const generateOTP = (length = 6) => {
    // Generate random bytes and convert to a number
    const max = Math.pow(10, length);
    const min = Math.pow(10, length - 1);

    // Use crypto for secure random number generation
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);

    // Scale to the desired range
    const otp = min + (randomNumber % (max - min));

    return otp.toString();
};

module.exports = {
    generateOTP
};
