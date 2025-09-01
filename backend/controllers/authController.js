const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;


exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    
    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email },
        { 'socialLogin.google.id': googleId }
      ]
    });

    if (user) {
      // Update existing user with Google info
      user.socialLogin.google = { id: googleId, email };
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email,
        socialLogin: {
          google: { id: googleId, email }
        },
        avatar: avatar || '',
        // Generate a random mobile for required field
        mobile: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
      });
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// Facebook OAuth callback
exports.facebookAuth = async (req, res) => {
  try {
    const { facebookId, email, name, avatar } = req.body;
    
    let user = await User.findOne({
      $or: [
        { email },
        { 'socialLogin.facebook.id': facebookId }
      ]
    });

    if (user) {
      user.socialLogin.facebook = { id: facebookId, email };
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      user = new User({
        name,
        email: email || `facebook_${facebookId}@alpha-chat.com`,
        socialLogin: {
          facebook: { id: facebookId, email }
        },
        avatar: avatar || '',
        mobile: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Facebook authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ message: 'Facebook authentication failed' });
  }
};

// LinkedIn OAuth callback
exports.linkedinAuth = async (req, res) => {
  try {
    const { linkedinId, email, name, avatar } = req.body;
    
    let user = await User.findOne({
      $or: [
        { email },
        { 'socialLogin.linkedin.id': linkedinId }
      ]
    });

    if (user) {
      user.socialLogin.linkedin = { id: linkedinId, email };
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      user = new User({
        name,
        email,
        socialLogin: {
          linkedin: { id: linkedinId, email }
        },
        avatar: avatar || '',
        mobile: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      message: 'LinkedIn authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    res.status(500).json({ message: 'LinkedIn authentication failed' });
  }
};


// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register User
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobile, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or mobile already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      mobile,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update online status
    user.isOnline = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout User
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Current User
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
