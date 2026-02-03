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
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index for automatic deletion
    }
}, {
    timestamps: true
});

// Hash token before saving
refreshTokenSchema.pre('save', async function (next) {
    if (!this.isModified('token')) return next();
    const salt = await bcrypt.genSalt(10);
    this.token = await bcrypt.hash(this.token, salt);
    next();
});

// Method to verify token
refreshTokenSchema.methods.compareToken = async function (candidateToken) {
    return await bcrypt.compare(candidateToken, this.token);
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
