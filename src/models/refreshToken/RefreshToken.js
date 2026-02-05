const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    deviceInfo: {
        name: { type: String, default: 'Unknown Device' },
        type: { type: String, default: 'unknown' },
        userAgent: { type: String, default: '' },
        ip: { type: String, default: '' }
    },
    lastUsedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index for automatic deletion
    }
}, {
    timestamps: true
});

// Compound index for efficient lookup by user and device
refreshTokenSchema.index({ userId: 1, deviceId: 1 });

// Hash token before saving
refreshTokenSchema.pre('save', async function () {
    if (!this.isModified('token')) return;
    const salt = await bcrypt.genSalt(10);
    this.token = await bcrypt.hash(this.token, salt);
});

// Method to verify token
refreshTokenSchema.methods.compareToken = async function (candidateToken) {
    return await bcrypt.compare(candidateToken, this.token);
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
