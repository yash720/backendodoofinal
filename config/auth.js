// config/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Token decoded:', decoded);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    // Also get the full user object for role checking
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.user = user;
    
    console.log('Middleware - req.userId:', req.userId, 'req.userRole:', req.userRole);
    
    next();
  } catch (err) {
    console.log('Token verification error:', err);
    res.status(401).json({ error: 'Invalid Token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access Denied: You do not have correct role' });
    }
    next();
  };
};

module.exports = { requireSignIn, verifyToken, authorizeRoles };
