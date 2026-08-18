const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  },
  job: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job' 
  },
  status: { 
    type: String, 
    enum: ['Applied', 'Test', 'Shortlisted', 'Interview', 'Offer', 'Rejected', 'Placed'],
    default: 'Applied'
  },
  appliedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  
  // Placement Timeline Tracking
  timeline: {
    applied: {
      date: { type: Date, default: Date.now },
      completed: { type: Boolean, default: true }
    },
    test: {
      date: Date,
      completed: { type: Boolean, default: false },
      score: Number,
      location: String,
      instructions: String
    },
    shortlisted: {
      date: Date,
      completed: { type: Boolean, default: false },
      message: String
    },
    interview: {
      date: Date,
      completed: { type: Boolean, default: false },
      location: String,
      type: { type: String, enum: ['Online', 'Offline', 'Hybrid'] },
      interviewer: String,
      duration: String,
      instructions: String
    },
    offer: {
      date: Date,
      completed: { type: Boolean, default: false },
      package: {
        fixed: Number,
        variable: Number,
        total: Number
      },
      joiningDate: Date,
      offerLetterUrl: String,
      acceptanceDeadline: Date
    },
    placed: {
      date: Date,
      completed: { type: Boolean, default: false },
      joiningDate: Date,
      companyLocation: String
    }
  },
  
  // Additional tracking fields
  currentStage: {
    type: String,
    enum: ['Applied', 'Test', 'Shortlisted', 'Interview', 'Offer', 'Rejected', 'Placed'],
    default: 'Applied'
  },
  stageProgress: {
    type: Number,
    default: 16.67, // 1/6 stages = 16.67%
    min: 0,
    max: 100
  },
  nextDeadline: Date,
  notes: [{
    content: String,
    addedBy: { type: String, enum: ['student', 'company', 'tpo'] },
    addedAt: { type: Date, default: Date.now }
  }],
  documents: [{
    name: String,
    type: String, // resume, cover_letter, certificates, etc.
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Application', applicationSchema);
