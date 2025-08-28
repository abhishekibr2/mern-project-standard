/**
 * Authentication routes
 * Routes for user authentication following FANG standards
 */

const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateSignup, validateLogin, validateForgotPassword, validateResetPassword, validateUpdatePassword } = require('../validators/authValidator');

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.patch('/reset-password/:token', validateResetPassword, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Token management
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(protect); // Protect all routes after this middleware

router.post('/logout', authController.logout);
router.patch('/update-password', validateUpdatePassword, authController.updatePassword);

module.exports = router;
