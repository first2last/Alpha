// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3
};

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.REACT_APP_NAME || 'Alpha Chat',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@alphachat.com',
  WEBSITE_URL: 'https://alphachat.com'
};

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'alpha_chat_token',
  REFRESH_TOKEN_KEY: 'alpha_chat_refresh_token',
  USER_KEY: 'alpha_chat_user',
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/webm'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv'
  ],
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  AVATAR_ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png']
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  SYSTEM: 'system'
};

// Chat Types
export const CHAT_TYPES = {
  PRIVATE: 'private',
  GROUP: 'group',
  BROADCAST: 'broadcast'
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// User Status
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
  INVISIBLE: 'invisible'
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  
  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATION_ERROR: 'authenticationError',
  
  // Chat
  JOIN_CHAT: 'joinChat',
  LEAVE_CHAT: 'leaveChat',
  SEND_MESSAGE: 'sendMessage',
  NEW_MESSAGE: 'newMessage',
  MESSAGE_DELIVERED: 'messageDelivered',
  MESSAGE_READ: 'messageRead',
  
  // Typing
  TYPING_START: 'typingStart',
  TYPING_STOP: 'typingStop',
  USER_TYPING: 'userTyping',
  
  // User Presence
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  USER_STATUS_CHANGED: 'userStatusChanged',
  
  // Calls
  CALL_INITIATE: 'callInitiate',
  CALL_ACCEPT: 'callAccept',
  CALL_REJECT: 'callReject',
  CALL_END: 'callEnd',
  CALL_OFFER: 'callOffer',
  CALL_ANSWER: 'callAnswer',
  ICE_CANDIDATE: 'iceCandidate',
  
  // Groups
  GROUP_CREATED: 'groupCreated',
  GROUP_UPDATED: 'groupUpdated',
  GROUP_DELETED: 'groupDeleted',
  USER_JOINED_GROUP: 'userJoinedGroup',
  USER_LEFT_GROUP: 'userLeftGroup',
  
  // Notifications
  NOTIFICATION: 'notification',
  
  // Errors
  ERROR: 'error'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  CALL: 'call',
  GROUP_INVITE: 'group_invite',
  FRIEND_REQUEST: 'friend_request',
  SYSTEM: 'system'
};

// Theme Configuration
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#1976d2',
  SECONDARY_COLOR: '#dc004e',
  SUCCESS_COLOR: '#4caf50',
  WARNING_COLOR: '#ff9800',
  ERROR_COLOR: '#f44336',
  INFO_COLOR: '#2196f3',
  
  // Breakpoints
  BREAKPOINTS: {
    XS: 0,
    SM: 600,
    MD: 900,
    LG: 1200,
    XL: 1536
  }
};

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s]+$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  MOBILE: {
    PATTERN: /^[6-9]\d{9}$/,
    LENGTH: 10
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  MESSAGE: {
    MAX_LENGTH: 1000
  },
  GROUP_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MESSAGES_PER_PAGE: 50,
  USERS_PER_PAGE: 10,
  CHATS_PER_PAGE: 20
};

// Cache Configuration
export const CACHE_CONFIG = {
  MESSAGES_CACHE_SIZE: 1000,
  USERS_CACHE_SIZE: 500,
  CHATS_CACHE_SIZE: 100,
  CACHE_EXPIRY: 5 * 60 * 1000 // 5 minutes
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please login again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  FILE_TOO_LARGE: 'File is too large. Maximum size allowed is',
  INVALID_FILE_TYPE: 'Invalid file type. Only these types are allowed:',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  CONNECTION_LOST: 'Connection lost. Attempting to reconnect...',
  CHAT_NOT_FOUND: 'Chat not found.',
  USER_NOT_FOUND: 'User not found.',
  MESSAGE_SEND_FAILED: 'Failed to send message. Please try again.',
  CALL_FAILED: 'Call failed. Please try again.',
  MICROPHONE_ERROR: 'Could not access microphone.',
  CAMERA_ERROR: 'Could not access camera.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  MESSAGE_SENT: 'Message sent',
  FILE_UPLOADED: 'File uploaded successfully',
  CALL_STARTED: 'Call started',
  CALL_ENDED: 'Call ended',
  USER_ADDED: 'User added successfully',
  USER_REMOVED: 'User removed successfully',
  GROUP_CREATED: 'Group created successfully',
  GROUP_UPDATED: 'Group updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'alpha_chat_token',
  REFRESH_TOKEN: 'alpha_chat_refresh_token',
  USER: 'alpha_chat_user',
  SETTINGS: 'alpha_chat_settings',
  THEME: 'alpha_chat_theme',
  LANGUAGE: 'alpha_chat_language',
  CHAT_DRAFTS: 'alpha_chat_drafts',
  NOTIFICATION_SETTINGS: 'alpha_chat_notifications'
};

// Date/Time Formats
export const DATE_FORMATS = {
  FULL: 'MMMM DD, YYYY HH:mm:ss',
  DATE_TIME: 'MM/DD/YYYY HH:mm',
  DATE_ONLY: 'MM/DD/YYYY',
  TIME_ONLY: 'HH:mm',
  RELATIVE: 'relative', // Using moment.js fromNow()
  MESSAGE_TIME: 'HH:mm',
  MESSAGE_DATE: 'MMM DD',
  CHAT_LIST_TIME: 'HH:mm'
};

// Feature Flags
export const FEATURES = {
  VOICE_MESSAGES: true,
  VIDEO_CALLS: true,
  AUDIO_CALLS: true,
  FILE_SHARING: true,
  GROUP_CHATS: true,
  REACTIONS: true,
  MESSAGE_EDITING: true,
  MESSAGE_DELETION: true,
  READ_RECEIPTS: true,
  TYPING_INDICATORS: true,
  ONLINE_STATUS: true,
  PUSH_NOTIFICATIONS: true,
  DARK_MODE: true,
  MULTIPLE_LANGUAGES: false,
  MESSAGE_ENCRYPTION: false,
  DISAPPEARING_MESSAGES: false
};

// WebRTC Configuration
export const WEBRTC_CONFIG = {
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],
  CONSTRAINTS: {
    AUDIO: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    },
    VIDEO: {
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 },
      frameRate: { min: 15, ideal: 30, max: 60 }
    }
  }
};

// Social Login Configuration
export const SOCIAL_LOGIN = {
  GOOGLE: {
    ENABLED: true,
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID
  },
  FACEBOOK: {
    ENABLED: true,
    APP_ID: process.env.REACT_APP_FACEBOOK_APP_ID,
    VERSION: 'v18.0'
  },
  LINKEDIN: {
    ENABLED: true,
    CLIENT_ID: process.env.REACT_APP_LINKEDIN_CLIENT_ID
  }
};

// Default Settings
export const DEFAULT_SETTINGS = {
  NOTIFICATIONS: {
    DESKTOP: true,
    SOUND: true,
    MESSAGE_PREVIEW: true,
    GROUP_NOTIFICATIONS: true
  },
  PRIVACY: {
    ONLINE_STATUS: true,
    LAST_SEEN: true,
    READ_RECEIPTS: true,
    TYPING_INDICATORS: true
  },
  CHAT: {
    ENTER_TO_SEND: true,
    AUTO_DOWNLOAD_MEDIA: true,
    SHOW_EMOJI_SUGGESTIONS: true,
    MESSAGE_FONT_SIZE: 'medium'
  },
  CALLS: {
    AUTO_ACCEPT_CALLS: false,
    CAMERA_DEFAULT_ON: false,
    MICROPHONE_DEFAULT_ON: true
  }
};

export default {
  API_CONFIG,
  APP_CONFIG,
  AUTH_CONFIG,
  FILE_UPLOAD,
  MESSAGE_TYPES,
  CHAT_TYPES,
  USER_ROLES,
  USER_STATUS,
  SOCKET_EVENTS,
  NOTIFICATION_TYPES,
  THEME_CONFIG,
  VALIDATION_RULES,
  PAGINATION,
  CACHE_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  DATE_FORMATS,
  FEATURES,
  WEBRTC_CONFIG,
  SOCIAL_LOGIN,
  DEFAULT_SETTINGS
};
