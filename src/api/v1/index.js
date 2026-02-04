const express = require('express');
const router = express.Router();
const authRoutes = require('./routes/auth.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'API working', timestamp: new Date().toISOString() });
});

// Auth routes
router.use('/auth', authRoutes);

module.exports = router;
