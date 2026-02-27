// server.js
require('dotenv').config();
const connectDB = require('./src/config/database');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Question = require('./src/models/question.model');

const app = express();
const PORT = process.env.PORT || 3000;

//Connect to MongoDB
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Route start here
app.get('/', (req, res)=>{
    res.status(200).json({message: "Welcome to root URL of Server", database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'});
});


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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});