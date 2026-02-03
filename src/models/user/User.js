const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        minlength: 3,
        maxlength: 30
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        maxlength: 254 // RFC 5321 max email length
    },
    password: {
        type: String,
        required: function () { return !this.googleId; }, // Required if not OAuth
        select: false // Not returned by default
    },
    profilePicture: {
        type: String,
        default: ''
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null/missing values
        index: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Adding indexes if needed for custom queries
userSchema.index({ email: 1, username: 1 });

module.exports = mongoose.model('User', userSchema);
