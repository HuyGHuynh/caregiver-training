const express = require('express');
const User = require('../models/user.model');
const Question = require('../models/question.model');
const router = express.Router();

// Complete a subsection
router.post('/complete-subsection', async (req, res) => {
    try {
        const { firebaseUid, subsection, category, section, points } = req.body;

        if (!firebaseUid || !subsection) {
            return res.status(400).json({
                success: false,
                error: 'Firebase UID and subsection are required'
            });
        }

        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check if subsection is unlocked
        if (!user.isSubsectionUnlocked(subsection)) {
            return res.status(403).json({
                success: false,
                error: 'Subsection is not yet unlocked'
            });
        }

        // Complete the subsection
        user.completeSubsection(subsection, category, section);

        // Add bonus points if provided
        if (points && points > 0) {
            user.progress.totalPoints += points;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Subsection completed successfully',
            data: {
                progress: user.progress,
                nextSubsection: user.progress.currentSubsection,
                pointsEarned: (points || 0) + 10,
                totalPoints: user.progress.totalPoints,
                completedCount: user.progress.completedSubsections.length,
                unlockedLessons: user.progress.completedSubsections
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user's course progress
router.get('/:firebaseUid/course/:category', async (req, res) => {
    try {
        const { firebaseUid, category } = req.params;

        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const courseProgress = user.getCourseProgress(category);

        res.status(200).json({
            success: true,
            data: courseProgress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get dashboard data
router.get('/:firebaseUid/dashboard', async (req, res) => {
    try {
        const { firebaseUid } = req.params;

        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get overall stats
        const stats = {
            streak: user.progress.streak,
            lessonsCompleted: user.progress.lessonsCompleted,
            totalPoints: user.progress.totalPoints,
            completedSubsections: user.progress.completedSubsections.length,
            currentSubsection: user.progress.currentSubsection
        };

        // Get course progress for all courses
        const courseProgressList = user.courseProgress.map(cp => {
            const progress = user.getCourseProgress(cp.category);
            return {
                ...progress,
                startDate: cp.startDate,
                lastActivity: cp.lastActivity
            };
        });

        res.status(200).json({
            success: true,
            data: {
                stats,
                courseProgress: courseProgressList,
                user: {
                    displayName: user.displayName,
                    email: user.email,
                    joinDate: user.joinDate,
                    preferences: user.preferences
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Check if subsection is unlocked for user
router.get('/:firebaseUid/unlock/:subsection', async (req, res) => {
    try {
        const { firebaseUid, subsection } = req.params;

        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const isUnlocked = user.isSubsectionUnlocked(subsection);
        const isCompleted = user.hasCompletedSubsection(subsection);

        res.status(200).json({
            success: true,
            data: {
                subsection,
                isUnlocked,
                isCompleted,
                currentSubsection: user.progress.currentSubsection
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get available subsections for a course
router.get('/:firebaseUid/available/:category', async (req, res) => {
    try {
        const { firebaseUid, category } = req.params;

        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get all questions for this category to determine available subsections
        const questions = await Question.find({ category });
        const availableSubsections = [...new Set(questions.map(q => q.subsection))].sort();

        // Check unlock status for each subsection
        const subsectionStatus = availableSubsections.map(subsection => {
            return {
                subsection,
                isUnlocked: user.isSubsectionUnlocked(subsection),
                isCompleted: user.hasCompletedSubsection(subsection),
                isCurrent: user.progress.currentSubsection === subsection
            };
        });

        res.status(200).json({
            success: true,
            data: {
                category,
                subsections: subsectionStatus,
                currentSubsection: user.progress.currentSubsection
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;