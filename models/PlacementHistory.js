const mongoose = require('mongoose');

const PlacementHistorySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  placementDate: {
    type: Date,
    default: Date.now
  },
  package: {
    fixed: Number,
    variable: Number,
    total: Number
  },
  joiningDate: Date,
  offerLetterURL: String,
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Terminated'],
    default: 'Active'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('PlacementHistory', PlacementHistorySchema);
