const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);