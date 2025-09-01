import moment from 'moment';
import { 
  FILE_UPLOAD, 
  DATE_FORMATS, 
  ERROR_MESSAGES, 
  VALIDATION_RULES,
  MESSAGE_TYPES 
} from './constants';

// Date and Time Helpers
export const formatDate = (date, format = DATE_FORMATS.DATE_TIME) => {
  if (!date) return '';
  
  const momentDate = moment(date);
  
  if (!momentDate.isValid()) return '';
  
  switch (format) {
    case DATE_FORMATS.RELATIVE:
      return momentDate.fromNow();
    case DATE_FORMATS.MESSAGE_TIME:
      return momentDate.calendar(null, {
        sameDay: 'HH:mm',
        lastDay: '[Yesterday] HH:mm',
        lastWeek: 'dddd HH:mm',
        sameElse: 'MMM DD HH:mm'
      });
    case DATE_FORMATS.CHAT_LIST_TIME:
      return momentDate.calendar(null, {
        sameDay: 'HH:mm',
        lastDay: 'Yesterday',
        lastWeek: 'dddd',
        sameElse: 'MMM DD'
      });
    default:
      return momentDate.format(format);
  }
};

export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

export const isYesterday = (date) => {
  return moment(date).isSame(moment().subtract(1, 'day'), 'day');
};

export const getTimeAgo = (date) => {
  return moment(date).fromNow();
};

export const formatDuration = (seconds) => {
  const duration = moment.duration(seconds, 'seconds');
  const hours = Math.floor(duration.asHours());
  const minutes = Math.floor(duration.asMinutes()) % 60;
  const secs = Math.floor(duration.asSeconds()) % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// File Helpers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const getFileType = (file) => {
  const { type, name } = file;
  
  if (type.startsWith('image/')) return MESSAGE_TYPES.IMAGE;
  if (type.startsWith('video/')) return MESSAGE_TYPES.VIDEO;
  if (type.startsWith('audio/')) return MESSAGE_TYPES.AUDIO;
  
  // Check by extension if MIME type is not specific
  const ext = getFileExtension(name);
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
  
  if (imageExts.includes(ext)) return MESSAGE_TYPES.IMAGE;
  if (videoExts.includes(ext)) return MESSAGE_TYPES.VIDEO;
  if (audioExts.includes(ext)) return MESSAGE_TYPES.AUDIO;
  
  return MESSAGE_TYPES.FILE;
};

export const validateFile = (file, options = {}) => {
  const {
    maxSize = FILE_UPLOAD.MAX_SIZE,
    allowedTypes = [...FILE_UPLOAD.ALLOWED_IMAGE_TYPES, ...FILE_UPLOAD.ALLOWED_VIDEO_TYPES, ...FILE_UPLOAD.ALLOWED_AUDIO_TYPES, ...FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES]
  } = options;
  
  const errors = [];
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`${ERROR_MESSAGES.FILE_TOO_LARGE} ${formatFileSize(maxSize)}`);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const extensions = allowedTypes.map(type => {
      const ext = type.split('/')[1];
      return ext === 'jpeg' ? 'jpg' : ext;
    }).join(', ');
    errors.push(`${ERROR_MESSAGES.INVALID_FILE_TYPE} ${extensions}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const createFilePreview = (file) => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    } else {
      resolve(null);
    }
  });
};

// String Helpers
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// User Helpers
export const getUserInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const getFullName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(' ');
};

export const maskEmail = (email) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
};

export const maskMobile = (mobile) => {
  if (!mobile) return '';
  return mobile.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');
};

// Validation Helpers
export const validateEmail = (email) => {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
};

export const validateMobile = (mobile) => {
  return VALIDATION_RULES.MOBILE.PATTERN.test(mobile);
};

export const validatePassword = (password) => {
  const { MIN_LENGTH, PATTERN } = VALIDATION_RULES.PASSWORD;
  
  return {
    isValid: password.length >= MIN_LENGTH && PATTERN.test(password),
    hasMinLength: password.length >= MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

export const getPasswordStrength = (password) => {
  const validation = validatePassword(password);
  const score = [
    validation.hasMinLength,
    validation.hasUppercase,
    validation.hasLowercase,
    validation.hasNumber,
    validation.hasSpecialChar
  ].filter(Boolean).length;
  
  let strength = 'Weak';
  let color = 'error';
  
  if (score >= 4) {
    strength = 'Strong';
    color = 'success';
  } else if (score >= 3) {
    strength = 'Medium';
    color = 'warning';
  }
  
  return { score, strength, color, ...validation };
};

// Array Helpers
export const uniqueById = (array, key = 'id') => {
  const seen = new Set();
  return array.filter(item => {
    const id = item[key];
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
};

export const sortByDate = (array, key = 'createdAt', order = 'desc') => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// URL Helpers
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const extractUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

export const addProtocol = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
};

// Local Storage Helpers
export const setStorageItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('Error setting storage item:', error);
    return false;
  }
};

export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting storage item:', error);
    return defaultValue;
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing storage item:', error);
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

// Device Helpers
export const isMobile = () => {
  return window.innerWidth <= 768;
};

export const isTablet = () => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = () => {
  return window.innerWidth > 1024;
};

export const getDeviceType = () => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Browser Helpers
export const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Color Helpers
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const generateRandomColor = () => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Debounce and Throttle
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Error Handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      message: data.message || ERROR_MESSAGES.SERVER_ERROR,
      status,
      type: 'server'
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      status: 0,
      type: 'network'
    };
  } else {
    // Something else happened
    return {
      message: error.message || ERROR_MESSAGES.GENERIC_ERROR,
      status: 0,
      type: 'unknown'
    };
  }
};

// Performance Helpers
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

export const createPerformanceObserver = (callback) => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    return observer;
  }
  return null;
};

export default {
  // Date and Time
  formatDate,
  isToday,
  isYesterday,
  getTimeAgo,
  formatDuration,
  
  // File
  formatFileSize,
  getFileExtension,
  getFileType,
  validateFile,
  createFilePreview,
  
  // String
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  generateRandomString,
  slugify,
  
  // User
  getUserInitials,
  getFullName,
  maskEmail,
  maskMobile,
  
  // Validation
  validateEmail,
  validateMobile,
  validatePassword,
  getPasswordStrength,
  
  // Array
  uniqueById,
  sortByDate,
  groupBy,
  shuffle,
  
  // URL
  isValidUrl,
  extractUrls,
  addProtocol,
  
  // Storage
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  
  // Device
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  isTouchDevice,
  
  // Browser
  getBrowserName,
  copyToClipboard,
  downloadFile,
  
  // Color
  hexToRgb,
  rgbToHex,
  generateRandomColor,
  
  // Utility
  debounce,
  throttle,
  handleApiError,
  measurePerformance,
  createPerformanceObserver
};
