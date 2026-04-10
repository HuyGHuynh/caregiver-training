const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health');
const questionRoutes = require('./questions');
const userRoutes = require('./users');
const progressRoutes = require('./progress');
const lessonRoutes = require('./lessons');

// Use route modules
router.use('/', healthRoutes); // Root and test routes
router.use('/api/questions', questionRoutes);
router.use('/api/users', userRoutes);
router.use('/api/progress', progressRoutes);
router.use('/api/lessons', lessonRoutes);

module.exports = router;