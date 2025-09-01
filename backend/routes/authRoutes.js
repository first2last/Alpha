const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  signup,
  login,
  logout,
  getMe,
  googleAuth,
  facebookAuth,
  linkedinAuth
} = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const signupValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('mobile').matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
// Add these routes to your existing authRoutes.js
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);
router.post('/linkedin', linkedinAuth);


module.exports = router;
