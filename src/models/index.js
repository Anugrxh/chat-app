// Central export for all models
const User = require('./user/User');
const RefreshToken = require('./refreshToken/RefreshToken');
const Connection = require('./connection/Connection');
const Otp = require('./otp/Otp');
// const Chat = require('./chat/Chat'); // TODO: Implement
// const Message = require('./message/Message'); // TODO: Implement

module.exports = {
    User,
    RefreshToken,
    Connection,
    Otp
    // Chat,
    // Message
};
