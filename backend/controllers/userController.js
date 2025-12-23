// controllers/userController.js
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all users (ADMIN ONLY)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  console.log('👥 GET USERS - Admin Check:');
  console.log('  - Request User:', req.user?.email);
  console.log('  - isAdmin:', req.user?.isAdmin);
  console.log('  - User ID:', req.user?._id);
  
  if (!req.user || !req.user.isAdmin) {
    console.log('❌ Not admin - sending 403');
    res.status(403);
    throw new Error('Admin access required');
  }

  console.log('✅ Admin verified, fetching users...');
  
  const users = await User.find({})
    .select('-password') // Exclude passwords
    .sort({ createdAt: -1 });
  
  console.log(`📊 Found ${users.length} users`);
  
  res.json(users);
});

// @desc    Get user by ID (ADMIN ONLY)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  console.log('👤 GET USER BY ID - Params:', req.params);
  
  const user = await User.findById(req.params.id).select('-password');
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user (ADMIN ONLY)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  
  // Only update admin status if provided
  if (req.body.isAdmin !== undefined) {
    user.isAdmin = req.body.isAdmin;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    createdAt: updatedUser.createdAt,
  });
});

// @desc    Delete user (ADMIN ONLY)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  await user.deleteOne();
  
  res.json({ 
    message: 'User deleted successfully',
    userId: req.params.id
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  
  // Update password if provided
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    createdAt: updatedUser.createdAt,
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
};