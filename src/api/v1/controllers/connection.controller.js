const connectionService = require('../services/connection.service');
const { asyncHandler } = require('../../../middleware/error.middleware');
const { successResponse } = require('../../../utils/response');
const { HTTP_STATUS } = require('../../../utils/constants');

/**
 * @desc    Send a connection request
 * @route   POST /api/v1/connections/request
 * @access  Private
 */
const sendRequest = asyncHandler(async (req, res) => {
    const { receiverId } = req.body;
    const connection = await connectionService.sendRequest(req.user._id, receiverId);
    return successResponse(res, { connection }, 'Connection request sent successfully', HTTP_STATUS.CREATED);
});

/**
 * @desc    Accept or reject a connection request
 * @route   PATCH /api/v1/connections/respond
 * @access  Private
 */
const respondToRequest = asyncHandler(async (req, res) => {
    const { requesterId, action } = req.body;
    const result = await connectionService.respondToRequest(req.user._id, requesterId, action);
    return successResponse(res, result, 'Response processed successfully', HTTP_STATUS.OK);
});

/**
 * @desc    Get all connections
 * @route   GET /api/v1/connections
 * @access  Private
 */
const getConnections = asyncHandler(async (req, res) => {
    const connections = await connectionService.getConnections(req.user._id);
    return successResponse(res, { connections }, 'Connections retrieved successfully', HTTP_STATUS.OK);
});

/**
 * @desc    Get pending requests
 * @route   GET /api/v1/connections/pending
 * @access  Private
 */
const getPending = asyncHandler(async (req, res) => {
    const requests = await connectionService.getPendingRequests(req.user._id);
    return successResponse(res, { requests }, 'Pending requests retrieved successfully', HTTP_STATUS.OK);
});

module.exports = {
    sendRequest,
    respondToRequest,
    getConnections,
    getPending
};
