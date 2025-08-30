const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  HRcontact: { 
    type: String, 
    required: true 
  },
  contactNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  jobs: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job' 
  }],
  applications: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application' 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
