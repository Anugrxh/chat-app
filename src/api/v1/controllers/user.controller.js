const userService = require('../services/user.service');
const { asyncHandler } = require('../../../middleware/error.middleware');
const { successResponse } = require('../../../utils/response');
const { HTTP_STATUS } = require('../../../utils/constants');

/**
 * @desc    Search for users
 * @route   GET /api/v1/users/search
 * @access  Private
 */
const search = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const users = await userService.searchUsers(q, req.user._id);
    return successResponse(res, { users }, 'Users retrieved successfully', HTTP_STATUS.OK);
});

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/profile/:id
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const profile = await userService.getUserProfile(req.params.id);
    return successResponse(res, { profile }, 'Profile retrieved successfully', HTTP_STATUS.OK);
});

/**
 * @desc    Update current user profile
 * @route   PATCH /api/v1/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateProfile(req.user._id, req.body);
    return successResponse(res, { user: updatedUser }, 'Profile updated successfully', HTTP_STATUS.OK);
});

module.exports = {
    search,
    getProfile,
    updateProfile
};
