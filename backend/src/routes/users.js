/**
 * User routes
 * Routes for user management following FANG standards
 */

const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateUpdateMe, validateCreateUser, validateUpdateUser } = require('../validators/userValidator');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Current user routes
router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', validateUpdateMe, userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

// Admin only routes
router.use(restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(validateCreateUser, userController.createUser);

router.get('/stats', userController.getUserStats);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(validateUpdateUser, userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
