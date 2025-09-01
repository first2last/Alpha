const { body, validationResult } = require('express-validator');

class ValidationUtil {
  // Custom validation result handler
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }

  // User registration validation rules
  static validateUserRegistration() {
    return [
      body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters'),

      body('mobile')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit Indian mobile number'),

      body('password')
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    ];
  }

  // User login validation rules
  static validateUserLogin() {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

      body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
    ];
  }

  // Profile update validation rules
  static validateProfileUpdate() {
    return [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

      body('mobile')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit Indian mobile number')
    ];
  }

  // Password change validation rules
  static validatePasswordChange() {
    return [
      body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

      body('newPassword')
        .isLength({ min: 6, max: 128 })
        .withMessage('New password must be between 6 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

      body('confirmPassword')
        .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match new password');
          }
          return true;
        })
    ];
  }

  // Message validation rules
  static validateMessage() {
    return [
      body('chatId')
        .isMongoId()
        .withMessage('Invalid chat ID'),

      body('content')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Message content cannot exceed 1000 characters'),

      body('messageType')
        .optional()
        .isIn(['text', 'image', 'video', 'file', 'audio'])
        .withMessage('Invalid message type')
    ];
  }

  // Chat creation validation rules
  static validateChatCreation() {
    return [
      body('participantId')
        .isMongoId()
        .withMessage('Invalid participant ID'),

      body('isGroupChat')
        .optional()
        .isBoolean()
        .withMessage('isGroupChat must be a boolean'),

      body('groupName')
        .if(body('isGroupChat').equals(true))
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Group name is required and must not exceed 100 characters')
    ];
  }

  // Search validation rules
  static validateSearch() {
    return [
      body('query')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Search query must be between 1 and 50 characters')
        .escape() // Prevent XSS attacks
    ];
  }

  // Pagination validation rules
  static validatePagination() {
    return [
      body('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

      body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
    ];
  }

  // Email validation helper
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Mobile validation helper
  static isValidMobile(mobile) {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  }

  // Password strength checker
  static checkPasswordStrength(password) {
    const minLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar]
      .filter(Boolean).length;

    let strength = 'Weak';
    if (score >= 4) strength = 'Strong';
    else if (score >= 3) strength = 'Medium';

    return {
      score,
      strength,
      requirements: {
        minLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        hasSpecialChar
      }
    };
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate MongoDB ObjectId
  static isValidObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  // File upload validation
  static validateFileUpload(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'video/mp4', 'video/avi', 'video/mov',
        'application/pdf', 'text/plain'
      ]
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    // Check if file exists
    if (!file || !file.buffer) {
      errors.push('No file provided or file is empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limiting validation
  static createRateLimitValidator(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const attempts = new Map();

    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old attempts
      attempts.forEach((timestamps, ip) => {
        const validTimestamps = timestamps.filter(time => time > windowStart);
        if (validTimestamps.length === 0) {
          attempts.delete(ip);
        } else {
          attempts.set(ip, validTimestamps);
        }
      });

      // Check current attempts
      const currentAttempts = attempts.get(key) || [];
      const validAttempts = currentAttempts.filter(time => time > windowStart);

      if (validAttempts.length >= maxAttempts) {
        return res.status(429).json({
          success: false,
          message: 'Too many attempts. Please try again later.',
          retryAfter: Math.ceil((validAttempts[0] + windowMs - now) / 1000)
        });
      }

      // Add current attempt
      validAttempts.push(now);
      attempts.set(key, validAttempts);

      next();
    };
  }
}

module.exports = ValidationUtil;
