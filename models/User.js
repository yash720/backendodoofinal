const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  role: { 
    type: String, 
    enum: ['student', 'company', 'tpo'], 
    required: true 
  },
  // Reference to specific user type
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    enum: ['Student', 'Company', 'TPO']
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
