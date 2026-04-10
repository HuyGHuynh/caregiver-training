const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    lessonKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    contentSummary: {
        overview: {
            type: String,
            default: ''
        },
        learningObjectives: [{
            type: String
        }],
        outcomes: [{
            type: String
        }],
        keyKnowledge: [{
            type: String
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema, 'lessons');
