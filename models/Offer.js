const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    required: true
  },
  job: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true
  },
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company',
    required: true
  },
  offerLetterURL: String,
  accepted: { type: Boolean, default: false },
  offeredOn: { type: Date, default: Date.now },
  joinedOn: Date,
  package: {
    fixed: Number,
    variable: Number,
    otherBenefits: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
