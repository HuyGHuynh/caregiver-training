const express = require('express');
const Progress = require('../models/progress.model');
const User = require('../models/user.model');
const router = express.Router();

// Create a new progress entry
router.post('/', async (req, res) => {
    try {
        const {
            firebaseUid,
            section,
            subsection,
            level,
            totalQuestions,
            correctAnswers,
            scorePercentage,
            completed,
            xpEarned
        } = req.body;

        if (!firebaseUid) {
            return res.status(400).json({ success: false, error: 'Firebase UID is required' });
        }

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const newProgress = new Progress({
            userId: user._id,
            section,
            subsection,
            level,
            totalQuestions,
            correctAnswers,
            scorePercentage,
            completed,
            completedAt: completed ? new Date() : null,
            xpEarned
        });

        const savedProgress = await newProgress.save();
        console.log('✅ Progress saved:', savedProgress._id.toString());

        res.status(201).json({
            success: true,
            data: savedProgress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all progress for a user
router.get('/:firebaseUid', async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const userProgress = await Progress.find({ userId: user._id });

        res.status(200).json({
            success: true,
            count: userProgress.length,
            data: userProgress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;