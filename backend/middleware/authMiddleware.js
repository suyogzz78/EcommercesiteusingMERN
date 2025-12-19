const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  console.log('🔐 PROTECT MIDDLEWARE - URL:', req.originalUrl);
  
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded - ID:', decoded.id, 'isAdmin:', decoded.isAdmin);
      
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User from DB:', req.user?.email, 'isAdmin:', req.user?.isAdmin);
      
      if (!req.user) {
        console.log('User not found in DB');
        res.status(401);
        throw new Error('User not found');
      }
      
      next();
    } catch (error) {
      console.log('Protect error:', error.message);
      res.status(401);
      throw new Error('Not authorized');
    }
  } else {
    console.log('No Bearer token');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

const admin = (req, res, next) => {
  console.log('👑 ADMIN MIDDLEWARE - User:', req.user?.email, 'isAdmin:', req.user?.isAdmin);
  
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    console.log('Admin check failed');
    res.status(403);
    throw new Error('Access denied. Admin only.');
  }
};

module.exports = { protect, admin };