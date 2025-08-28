/**
 * User validation schemas
 * Input validation for user routes following FANG standards
 */

const { body, validationResult } = require('express-validator');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ApiError(400, errorMessages.join('. ')));
  }
  next();
};

/**
 * Update current user validation
 */
const validateUpdateMe = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),

  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be longer than 500 characters'),

  body('profile.website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),

  body('profile.location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot be longer than 100 characters'),

  body('profile.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),

  body('profile.phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be valid'),

  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),

  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be boolean'),

  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),

  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be between 2 and 5 characters'),

  // Prevent updating restricted fields
  body('email').not().exists().withMessage('Email cannot be updated through this endpoint'),
  body('role').not().exists().withMessage('Role cannot be updated through this endpoint'),
  body('password').not().exists().withMessage('Password cannot be updated through this endpoint'),
  body('active').not().exists().withMessage('Active status cannot be updated through this endpoint'),

  handleValidationErrors
];

/**
 * Create user validation (Admin only)
 */
const validateCreateUser = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot be longer than 100 characters'),

  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Role must be user, admin, or moderator'),

  handleValidationErrors
];

/**
 * Update user validation (Admin only)
 */
const validateUpdateUser = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot be longer than 100 characters'),

  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Role must be user, admin, or moderator'),

  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active status must be boolean'),

  body('emailVerified')
    .optional()
    .isBoolean()
    .withMessage('Email verified status must be boolean'),

  // Prevent updating password through this endpoint
  body('password').not().exists().withMessage('Password cannot be updated through this endpoint'),

  handleValidationErrors
];

module.exports = {
  validateUpdateMe,
  validateCreateUser,
  validateUpdateUser
};
