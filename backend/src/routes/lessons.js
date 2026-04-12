const express = require('express');
const Lesson = require('../models/lesson.model');
const router = express.Router();

// Get a lesson by subsection number (for example 1.1)
router.get('/by-subsection/:subsection', async (req, res) => {
    try {
        const { subsection } = req.params;
        const escapedSubsection = subsection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const lesson = await Lesson.findOne({
            lessonKey: new RegExp(`^${escapedSubsection}_`, 'i')
        });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: 'Lesson not found'
            });
        }

        res.status(200).json({
            success: true,
            data: lesson
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get a lesson by lessonKey
router.get('/:lessonKey', async (req, res) => {
    try {
        const { lessonKey } = req.params;
        const lesson = await Lesson.findOne({ lessonKey });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                error: 'Lesson not found'
            });
        }

        res.status(200).json({
            success: true,
            data: lesson
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
