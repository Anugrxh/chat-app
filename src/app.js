// src/app.js
const express = require('express');
const cors = require('cors');
const v1Routes = require('./api/v1');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body limit for security
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// API routes
app.use('/api/v1', v1Routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
