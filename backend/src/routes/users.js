const express = require('express');
const User = require('../models/user.model');
const router = express.Router();

// Create or update user profile
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/users called with:', req.body);
        const { firebaseUid, email, displayName, photoURL } = req.body;

        if (!firebaseUid || !email) {
            console.log('Missing required fields:', { firebaseUid: !!firebaseUid, email: !!email });
            return res.status(400).json({
                success: false,
                error: 'Firebase UID and email are required'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ firebaseUid });
        console.log('Existing user found:', !!user);

        if (user) {
            // Update existing user
            user.email = email;
            user.displayName = displayName || user.displayName;
            user.photoURL = photoURL || user.photoURL;
            user.lastActivity = new Date();
            await user.save();
            console.log('User updated successfully');
        } else {
            // Create new user
            user = new User({
                firebaseUid,
                email,
                displayName: displayName || '',
                photoURL: photoURL || null,
                progress: {
                    completedSubsections: [],
                    currentSubsection: '1.1',
                    lessonsCompleted: 0,
                    totalPoints: 0,
                    streak: 0,
                    lastStreakDate: null
                },
                courseProgress: []
            });
            await user.save();
            console.log('New user created successfully');
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in POST /api/users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user profile and progress
router.get('/:firebaseUid', async (req, res) => {
    try {
        console.log('GET /api/users/:firebaseUid called with:', req.params.firebaseUid);
        const { firebaseUid } = req.params;

        const user = await User.findOne({ firebaseUid });
        console.log('User found:', !!user);

        if (!user) {
            console.log('User not found for UID:', firebaseUid);
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update last activity
        user.lastActivity = new Date();
        await user.save();
        console.log('User data retrieved successfully');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in GET /api/users/:firebaseUid:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update user preferences
router.put('/:firebaseUid/preferences', async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const { fontSize, enableSound, theme } = req.body;

        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update preferences
        if (fontSize) user.preferences.fontSize = fontSize;
        if (enableSound !== undefined) user.preferences.enableSound = enableSound;
        if (theme) user.preferences.theme = theme;

        user.lastActivity = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;