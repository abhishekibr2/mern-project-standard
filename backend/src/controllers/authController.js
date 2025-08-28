/**
 * Authentication controller
 * Handles user authentication operations following FANG standards
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, catchAsync } = require('../middleware/errorHandler');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Generate JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate refresh token
 */
const signRefreshToken = (id) => {
  return jwt.sign({ id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Create and send token response
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  
  // Store refresh token in user document
  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date()
  });
  
  // Keep only last 5 refresh tokens
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  
  // Save the user with refresh tokens
  user.save({ validateBeforeSave: false });

  const cookieOptions = {
    ...config.cookie.options,
    expires: new Date(Date.now() + config.cookie.options.maxAge)
  };

  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Create a clean user object for response (don't modify the original user object)
  const userResponse = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    role: user.role,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    active: user.active,
    lastLogin: user.lastLogin,
    preferences: user.preferences,
    profile: user.profile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: {
      user: userResponse
    }
  });
};

/**
 * Sign up new user
 */
const signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, username, password, passwordConfirm } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    return next(new ApiError(400, `User with this ${field} already exists`));
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    username,
    password,
    passwordConfirm
  });

  // Generate email verification token
  const verifyToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  logger.info(`New user registered: ${email}`);

  // TODO: Send verification email
  // await sendVerificationEmail(newUser, verifyToken);

  createSendToken(newUser, 201, res);
});

/**
 * Log in user
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide email and password!'));
  }

  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  // Check if account is locked
  if (user && user.isLocked) {
    return next(new ApiError(423, 'Account temporarily locked due to too many failed login attempts'));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    if (user) {
      await user.incLoginAttempts();
    }
    return next(new ApiError(401, 'Incorrect email or password'));
  }

  // 3) Reset login attempts and update last login
  await user.resetLoginAttempts();
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${email}`);

  // 4) If everything ok, send token to client
  createSendToken(user, 200, res);
});

/**
 * Log out user
 */
const logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken && req.user) {
    // Remove refresh token from user document
    req.user.refreshTokens = req.user.refreshTokens.filter(
      tokenObj => tokenObj.token !== refreshToken
    );
    await req.user.save({ validateBeforeSave: false });
  }

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

/**
 * Refresh JWT token
 */
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new ApiError(401, 'No refresh token provided'));
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new ApiError(401, 'Invalid refresh token'));
  }

  // Check if refresh token exists in user's tokens
  const tokenExists = user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken);
  if (!tokenExists) {
    return next(new ApiError(401, 'Invalid refresh token'));
  }

  // Generate new tokens
  createSendToken(user, 200, res);
});

/**
 * Forgot password
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(404, 'There is no user with that email address.'));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    // TODO: Send password reset email
    // await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new ApiError(500, 'There was an error sending the email. Try again later.')
    );
  }
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new ApiError(400, 'Token is invalid or has expired'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user (done in pre-save middleware)

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

/**
 * Update current user password
 */
const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new ApiError(401, 'Your current password is wrong.'));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

/**
 * Verify email
 */
const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ApiError(400, 'Token is invalid or has expired'));
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!'
  });
});

module.exports = {
  signup,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail
};
