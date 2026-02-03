const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['login', 'verification', 'password_reset'],
        default: 'login'
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Document expires at this specific time
    }
}, {
    timestamps: true
});

// Hash OTP before saving
otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) return next();
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
});

// Method to verify OTP
otpSchema.methods.compareOtp = async function (candidateOtp) {
    return await bcrypt.compare(candidateOtp, this.otp);
};

module.exports = mongoose.model('Otp', otpSchema);
