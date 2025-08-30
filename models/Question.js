const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    A: {
      type: String,
      required: true,
      trim: true
    },
    B: {
      type: String,
      required: true,
      trim: true
    },
    C: {
      type: String,
      required: true,
      trim: true
    },
    D: {
      type: String,
      required: true,
      trim: true
    }
  },
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  marks: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TPO',
    required: true
  },
  questionSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionSet'
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
