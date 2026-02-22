const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connection.controller');
const { authenticate } = require('../../../middleware/auth.middleware');

// All connection routes are protected
router.use(authenticate);

router.post('/request', connectionController.sendRequest);
router.patch('/respond', connectionController.respondToRequest);
router.get('/', connectionController.getConnections);
router.get('/pending', connectionController.getPending);

module.exports = router;
