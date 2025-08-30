// models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  package: { 
    type: Number, 
    required: true 
  },
  eligibilityCriteria: [{ 
    type: String, 
    required: true 
  }],
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true
  },
  deadline: { 
    type: Date, 
    required: true 
  },
  applications: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application' 
  }],
  status: { 
    type: String, 
    default: 'Open',
    enum: ['Open', 'Closed', 'On Hold']
  },
  approvalStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TPO'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  compensation: {
    fixed: Number,
    variable: Number,
    otherBenefits: [String]
  },
  timeline: {
    onlineTest: Date,
    interview: Date,
    finalOffer: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
