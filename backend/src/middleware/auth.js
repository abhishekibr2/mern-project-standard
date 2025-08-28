/**
 * Authentication middleware
 * JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const { ApiError, catchAsync } = require('./errorHandler');
const config = require('../config');

/**
 * Protect routes - verify JWT token
 */
const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new ApiError(401, 'You are not logged in! Please log in to get access.')
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+active');
  if (!currentUser) {
    return next(
      new ApiError(401, 'The user belonging to this token does no longer exist.')
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new ApiError(401, 'User recently changed password! Please log in again.')
    );
  }

  // 5) Check if user account is active
  if (!currentUser.active) {
    return next(new ApiError(401, 'Your account has been deactivated. Please contact support.'));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

/**
 * Restrict to certain roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'You do not have permission to perform this action')
      );
    }
    next();
  };
};

/**
 * Check if user is logged in (for rendered pages)
 */
const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        config.jwt.secret
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

/**
 * Optional authentication - doesn't throw error if no token
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, config.jwt.secret);
      const currentUser = await User.findById(decoded.id).select('+active');
      
      if (currentUser && currentUser.active && !currentUser.changedPasswordAfter(decoded.iat)) {
        req.user = currentUser;
      }
    } catch (err) {
      // Token is invalid, but we don't throw an error
      req.user = null;
    }
  }

  next();
});

module.exports = {
  protect,
  restrictTo,
  isLoggedIn,
  optionalAuth
};
