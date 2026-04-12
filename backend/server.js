// server.js
require('dotenv').config();
const connectDB = require('./src/config/database');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Question = require('./src/models/question.model');
const User = require('./src/models/user.model');
const apiRoutes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

//Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

//Route start here
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.status(200).json({ message: "Welcome to root URL of Server", database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// Test route for debugging
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

// Health check for API
app.get('/api/health', (req, res) => {
  console.log('Health check route hit');
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date()
  });
});

// Mount the modular API routes so /api/progress writes to the Progress collection
app.use('/', apiRoutes);


// Get questions with filters (subsection, category, level, section)
app.get('/api/questions', async (req, res) => {
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

// ==========================================
// USER MANAGEMENT ENDPOINTS
// ==========================================

// Create or update user profile
app.post('/api/users', async (req, res) => {
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
app.get('/api/users/:firebaseUid', async (req, res) => {
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
app.put('/api/users/:firebaseUid/preferences', async (req, res) => {
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

// ==========================================
// PROGRESS TRACKING ENDPOINTS
// ==========================================

// Complete a subsection
app.post('/api/progress/complete-subsection', async (req, res) => {
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
app.get('/api/progress/:firebaseUid/course/:category', async (req, res) => {
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
app.get('/api/progress/:firebaseUid/dashboard', async (req, res) => {
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
app.get('/api/progress/:firebaseUid/unlock/:subsection', async (req, res) => {
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
app.get('/api/progress/:firebaseUid/available/:category', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/test`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`💾 Database Status: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
});