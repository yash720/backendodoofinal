const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access Denied: No Token Provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get the full user object
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (err) {
    console.log('Token verification error:', err);
    res.status(401).json({ error: 'Invalid Token' });
  }
};

// Authorize TPO middleware
const authorizeTPO = (req, res, next) => {
  if (req.userRole !== 'tpo') {
    return res.status(403).json({ 
      error: 'Access Denied: TPO role required' 
    });
  }
  next();
};

// Authorize Student middleware
const authorizeStudent = (req, res, next) => {
  if (req.userRole !== 'student') {
    return res.status(403).json({ 
      error: 'Access Denied: Student role required' 
    });
  }
  next();
};

// Authorize Company middleware
const authorizeCompany = (req, res, next) => {
  if (req.userRole !== 'company') {
    return res.status(403).json({ 
      error: 'Access Denied: Company role required' 
    });
  }
  next();
};

// Generic role authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ 
        error: 'Access Denied: You do not have the required role' 
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeTPO,
  authorizeStudent,
  authorizeCompany,
  authorizeRoles
};

