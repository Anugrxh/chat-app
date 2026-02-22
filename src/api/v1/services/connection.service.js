const { Connection, User } = require('../../../models');
const { AppError } = require('../../../middleware/error.middleware');
const { HTTP_STATUS } = require('../../../utils/constants');

/**
 * Send a connection request
 * @param {string} senderId 
 * @param {string} receiverId 
 */
const sendRequest = async (senderId, receiverId) => {
    if (senderId.toString() === receiverId.toString()) {
        throw new AppError('You cannot send a connection request to yourself', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        throw new AppError('Receiver user not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if a connection already exists
    const existingConnection = await Connection.findOne({
        $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
        ]
    });

    if (existingConnection) {
        if (existingConnection.status === 'accepted') {
            throw new AppError('You are already connected with this user', HTTP_STATUS.CONFLICT);
        }
        if (existingConnection.status === 'pending') {
            const message = existingConnection.senderId.toString() === senderId.toString()
                ? 'Request already sent and is pending'
                : 'This user has already sent you a request';
            throw new AppError(message, HTTP_STATUS.CONFLICT);
        }
        if (existingConnection.status === 'blocked') {
            throw new AppError('Cannot send request to this user', HTTP_STATUS.FORBIDDEN);
        }
    }

    return await Connection.create({ senderId, receiverId, status: 'pending' });
};

/**
 * Handle connection request (Accept/Reject)
 * @param {string} userId - ID of user responding (receiver)
 * @param {string} requesterId - ID of user who sent the request
 * @param {string} action - 'accept' or 'reject'
 */
const respondToRequest = async (userId, requesterId, action) => {
    const connection = await Connection.findOne({
        senderId: requesterId,
        receiverId: userId,
        status: 'pending'
    });

    if (!connection) {
        throw new AppError('Pending connection request not found', HTTP_STATUS.NOT_FOUND);
    }

    if (action === 'accept') {
        connection.status = 'accepted';
        await connection.save();
        return connection;
    } else {
        await Connection.deleteOne({ _id: connection._id });
        return { message: 'Request rejected' };
    }
};

/**
 * Get all accepted connections for a user
 * @param {string} userId 
 */
const getConnections = async (userId) => {
    const connections = await Connection.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: 'accepted'
    }).populate('senderId receiverId', 'username fullname profilePicture isOnline');

    // Filter out the current user from populated fields so we only see the "other" person
    return connections.map(conn => {
        const otherUser = conn.senderId._id.toString() === userId.toString()
            ? conn.receiverId
            : conn.senderId;
        return {
            connectionId: conn._id,
            user: otherUser,
            since: conn.updatedAt
        };
    });
};

/**
 * Get pending incoming requests
 * @param {string} userId 
 */
const getPendingRequests = async (userId) => {
    return await Connection.find({
        receiverId: userId,
        status: 'pending'
    }).populate('senderId', 'username fullname profilePicture');
};

module.exports = {
    sendRequest,
    respondToRequest,
    getConnections,
    getPendingRequests
};
