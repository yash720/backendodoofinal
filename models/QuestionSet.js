const mongoose = require('mongoose');

const questionSetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  maximumMarks: {
    type: Number,
    required: true,
    min: 1
  },
  marksPerQuestion: {
    type: Number,
    required: true,
    min: 1
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  timeLimit: {
    type: Number, // in minutes
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TPO',
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, { timestamps: true });

module.exports = mongoose.model('QuestionSet', questionSetSchema);
