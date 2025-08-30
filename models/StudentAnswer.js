const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  questionSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionSet',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksObtained: {
      type: Number,
      default: 0
    },
    timeTaken: {
      type: Number // in seconds
    }
  }],
  totalMarksObtained: {
    type: Number,
    default: 0
  },
  totalMarksPossible: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isSubmitted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Calculate percentage before saving
studentAnswerSchema.pre('save', function(next) {
  if (this.totalMarksPossible > 0) {
    this.percentage = (this.totalMarksObtained / this.totalMarksPossible) * 100;
  }
  next();
});

module.exports = mongoose.model('StudentAnswer', studentAnswerSchema);

