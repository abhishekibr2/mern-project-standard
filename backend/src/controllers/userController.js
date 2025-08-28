/**
 * User controller
 * Handles user CRUD operations following FANG standards
 */

const User = require('../models/User');
const { ApiError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Filter allowed fields from object
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Get all users (Admin only)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';

  // Build filter object
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.active !== undefined) filter.active = req.query.active === 'true';
  if (req.query.emailVerified !== undefined) filter.emailVerified = req.query.emailVerified === 'true';

  // Build search query
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { username: searchRegex }
    ];
  }

  const users = await User.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-__v');

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      users
    }
  });
});

/**
 * Get user by ID
 */
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-__v');

  if (!user) {
    return next(new ApiError(404, 'No user found with that ID'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * Get current user profile
 */
const getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

/**
 * Update current user data
 */
const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new ApiError(400, 'This route is not for password updates. Please use /update-password.')
    );
  }

  // 2) Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'username',
    'avatar',
    'preferences',
    'profile'
  );

  // 3) Check if username is being updated and is unique
  if (filteredBody.username) {
    const existingUser = await User.findOne({ 
      username: filteredBody.username,
      _id: { $ne: req.user.id }
    });
    
    if (existingUser) {
      return next(new ApiError(400, 'Username already taken'));
    }
  }

  // 4) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  logger.info(`User updated profile: ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

/**
 * Deactivate current user account
 */
const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  logger.info(`User deactivated account: ${req.user.email}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Create new user (Admin only)
 */
const createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  logger.info(`Admin created new user: ${newUser.email}`);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

/**
 * Update user (Admin only)
 */
const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ApiError(404, 'No user found with that ID'));
  }

  logger.info(`Admin updated user: ${user.email}`);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

/**
 * Delete user (Admin only)
 */
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'No user found with that ID'));
  }

  logger.info(`Admin deleted user: ${user.email}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get user statistics (Admin only)
 */
const getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ['$emailVerified', true] }, 1, 0] }
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        }
      }
    }
  ]);

  const recentUsers = await User.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        adminUsers: 0
      },
      recentSignups: recentUsers
    }
  });
});

module.exports = {
  getAllUsers,
  getUser,
  getMe,
  updateMe,
  deleteMe,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
};
