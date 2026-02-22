const { User } = require('../../../models');
const { AppError } = require('../../../middleware/error.middleware');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../../utils/constants');

/**
 * Search users by username or fullname
 * @param {string} query - Search term
 * @param {string} currentUserId - ID of user performing the search (to excludes self)
 * @returns {Promise<Array>} - List of users matching the query
 */
const searchUsers = async (query, currentUserId) => {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const searchRegex = new RegExp(query, 'i');

    return await User.find({
        $and: [
            { _id: { $ne: currentUserId } },
            {
                $or: [
                    { username: searchRegex },
                    { fullname: searchRegex }
                ]
            }
        ]
    }).select('username fullname profilePicture isOnline');
};

/**
 * Get user public profile
 * @param {string} userId - ID of user to fetch
 * @returns {Promise<Object>} - User profile data
 */
const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('username fullname profilePicture isOnline createdAt');
    if (!user) {
        throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return user;
};

/**
 * Update user profile
 * @param {string} userId - ID of user to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated user
 */
const updateProfile = async (userId, updateData) => {
    const allowedUpdates = ['fullname', 'profilePicture'];
    const updates = Object.keys(updateData);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        throw new AppError(ERROR_MESSAGES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    }).select('username fullname profilePicture email');

    if (!user) {
        throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return user;
};

module.exports = {
    searchUsers,
    getUserProfile,
    updateProfile
};
