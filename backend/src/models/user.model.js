const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    completedSubsections: [{
        type: String,
        required: true
    }],
    currentSubsection: {
        type: String,
        default: null
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completionDate: {
        type: Date,
        default: null
    }
});

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    displayName: {
        type: String,
        default: ''
    },
    photoURL: {
        type: String,
        default: null
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },

    // Overall progress tracking
    progress: {
        completedSubsections: [{
            type: String
        }],
        currentCourse: {
            type: String,
            default: null
        },
        currentSection: {
            type: String,
            default: null
        },
        currentSubsection: {
            type: String,
            default: '1.1'
        },

        // Statistics
        lessonsCompleted: {
            type: Number,
            default: 0
        },
        totalPoints: {
            type: Number,
            default: 0
        },
        streak: {
            type: Number,
            default: 0
        },
        lastStreakDate: {
            type: Date,
            default: null
        }
    },

    // Course-specific progress
    courseProgress: [courseProgressSchema],

    // Settings/Preferences
    preferences: {
        fontSize: {
            type: String,
            default: 'medium'
        },
        enableSound: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            default: 'light'
        }
    }
}, {
    timestamps: true
});

// Helper methods
userSchema.methods.hasCompletedSubsection = function (subsection) {
    return this.progress.completedSubsections.includes(subsection);
};

userSchema.methods.isSubsectionUnlocked = function (subsection) {
    // Extract section and subsection number (e.g., "1.1" -> section: 1, sub: 1)
    const [section, sub] = subsection.split('.').map(Number);

    // First subsection is always unlocked
    if (section === 1 && sub === 1) {
        return true;
    }

    // Check if previous subsection is completed
    if (sub > 1) {
        const previousSubsection = `${section}.${sub - 1}`;
        return this.hasCompletedSubsection(previousSubsection);
    }

    // Check if moving to new section (e.g., 2.1 requires 1.4 completed)
    if (section > 1 && sub === 1) {
        const lastSubsectionOfPreviousSection = `${section - 1}.4`; // Assuming 4 lessons per section
        return this.hasCompletedSubsection(lastSubsectionOfPreviousSection);
    }

    return false;
};

userSchema.methods.completeSubsection = function (subsection, category = null, section = null) {
    // Add to completed subsections if not already completed
    if (!this.hasCompletedSubsection(subsection)) {
        this.progress.completedSubsections.push(subsection);
        this.progress.lessonsCompleted += 1;
        this.progress.totalPoints += 10; // Award points for completion

        // Update current subsection to next available
        const [sectionNum, subNum] = subsection.split('.').map(Number);
        let nextSubsection;

        // Check if we're moving to next section (e.g., from 1.4 to 2.1)
        if (subNum >= 4 && sectionNum === 1) { // End of section 1
            nextSubsection = '2.1';
        } else if (subNum >= 4 && sectionNum === 2) { // End of section 2  
            nextSubsection = '3.1';
        } else {
            // Regular progression within same section
            nextSubsection = `${sectionNum}.${subNum + 1}`;
        }

        this.progress.currentSubsection = nextSubsection;
        console.log(`✅ Subsection ${subsection} completed. Next: ${nextSubsection}`);
    }

    // Update course-specific progress
    if (category && section) {
        let courseProgress = this.courseProgress.find(cp => cp.category === category);
        if (!courseProgress) {
            courseProgress = {
                category,
                section,
                completedSubsections: [],
                currentSubsection: subsection,
                startDate: new Date(),
                lastActivity: new Date(),
                isCompleted: false
            };
            this.courseProgress.push(courseProgress);
        }

        if (!courseProgress.completedSubsections.includes(subsection)) {
            courseProgress.completedSubsections.push(subsection);
        }
        courseProgress.lastActivity = new Date();
        courseProgress.currentSubsection = this.progress.currentSubsection;
    }

    // Update last activity and streak
    this.lastActivity = new Date();
    this.updateStreak();
};

userSchema.methods.updateStreak = function () {
    const today = new Date();
    const todayStr = today.toDateString();
    const lastStreakStr = this.progress.lastStreakDate ? this.progress.lastStreakDate.toDateString() : null;

    if (lastStreakStr === todayStr) {
        // Already counted today
        return;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastStreakStr === yesterdayStr) {
        // Consecutive day
        this.progress.streak += 1;
    } else if (!lastStreakStr || lastStreakStr !== todayStr) {
        // First day or broken streak
        this.progress.streak = 1;
    }

    this.progress.lastStreakDate = today;
};

userSchema.methods.getCourseProgress = function (category) {
    const courseProgress = this.courseProgress.find(cp => cp.category === category);
    if (!courseProgress) {
        return {
            category,
            completedSubsections: [],
            progress: 0,
            isStarted: false
        };
    }

    // Calculate progress percentage (assuming max 20 subsections per course for now)
    const totalSubsections = 20; // This should be dynamic based on actual course content
    const completedCount = courseProgress.completedSubsections.length;
    const progressPercentage = Math.min(Math.round((completedCount / totalSubsections) * 100), 100);

    return {
        category,
        section: courseProgress.section,
        completedSubsections: courseProgress.completedSubsections,
        currentSubsection: courseProgress.currentSubsection,
        progress: progressPercentage,
        isStarted: completedCount > 0,
        isCompleted: courseProgress.isCompleted,
        startDate: courseProgress.startDate,
        lastActivity: courseProgress.lastActivity
    };
};

module.exports = mongoose.model('User', userSchema);