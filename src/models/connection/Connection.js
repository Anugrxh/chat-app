const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Create a compound index to quickly find status between two users
connectionSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
// Reverse-lookup index for "who sent me a request?" queries
connectionSchema.index({ receiverId: 1, senderId: 1 });
// Index for status queries
connectionSchema.index({ status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
