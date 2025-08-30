const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String,
    required: true 
  },
  rollNumber: { 
    type: String,
    required: true
  },
  branch: { 
    type: String,
    required: true
  },
  graduationYear: { 
    type: Number,
    required: true
  },
  cgpa: { 
    type: Number
  },
  skills: [{ 
    type: String 
  }],
  // Placement status
  placementStatus: {
    type: String,
    enum: ['Not Placed', 'Placed', 'In Process'],
    default: 'Not Placed'
  },
  placementDetails: {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    package: {
      fixed: Number,
      variable: Number,
      total: Number
    },
    joiningDate: Date,
    offerLetterURL: String
  },
  // relations
  applications: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application' 
  }],
  resumes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Resume' 
  }],
  placementHistory: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PlacementHistory' 
  }],
  // Ranking and Score System
  totalScore: {
    type: Number,
    default: 0
  },
  quizScores: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet' },
    score: Number,
    percentage: Number,
    completedAt: Date
  }],
  badges: [{
    type: String,
    enum: [
      'Top Scorer',
      'Consistent Performer', 
      'Rising Star',
      'Quiz Master',
      'Perfect Score',
      'Speed Demon',
      'Knowledge Seeker',
      'First Place',
      'Top 10',
      'Top 25'
    ]
  }],
  rank: {
    type: Number,
    default: 0
  },
  totalQuizzesTaken: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  highestScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);