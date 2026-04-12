const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Root route
router.get('/', (req, res) => {
    console.log('Root route hit');
    res.status(200).json({
        message: "Welcome to root URL of Server",
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Test route for debugging
router.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Server is working!', timestamp: new Date() });
});

// Health check for API
router.get('/api/health', (req, res) => {
    console.log('Health check route hit');
    res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date()
    });
});

module.exports = router;