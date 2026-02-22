const express = require('express');
const router = express.Router();
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const connectionRoutes = require('./routes/connection.routes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'API working',
    timestamp: new Date()
  });
});

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Connection routes
router.use('/connections', connectionRoutes);

module.exports = router;
