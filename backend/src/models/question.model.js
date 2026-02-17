const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  level: {
    type: String,
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
  sourceType: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  content: {
    text: {
      type: String,
      required: true
    }
  },
  choices: [{
    key: String,
    text: String
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Question', questionSchema);