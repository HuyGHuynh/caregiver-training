const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    section: {
        type: String,
        required: true
    },
    subsection: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true
    },
    scorePercentage: {
        type: Number,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    xpEarned: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema, 'progress');
