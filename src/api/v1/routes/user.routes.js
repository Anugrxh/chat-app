const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../../../middleware/auth.middleware');

// All user routes are protected
router.use(authenticate);

router.get('/search', userController.search);
router.get('/profile/:id', userController.getProfile);
router.patch('/profile', userController.updateProfile);

module.exports = router;
