const express = require('express');
const Question = require('../models/question.model');
const router = express.Router();

// Get questions with filters (subsection, category, level, section)
router.get('/', async (req, res) => {
    try {
        const { subsection, category, level, section } = req.query;

        // Build filter object based on query parameters
        const filter = {};

        if (subsection) {
            // Escape special regex characters and match from start
            const escapedSubsection = subsection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.subsection = new RegExp(`^${escapedSubsection}`, 'i');
        }
        if (category) filter.category = category;
        if (level) filter.level = level;
        if (section) filter.section = section;

        const questions = await Question.find(filter);

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;