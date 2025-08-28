/**
 * Application configuration
 * Centralized configuration management following FANG standards
 */

require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_app',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/mern_app_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_this',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_change_this',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  },

  // Cookie configuration
  cookie: {
    secret: process.env.COOKIE_SECRET || 'fallback_cookie_secret_change_this',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  },

  // Email configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'simple'
  }
};

// Validation for required environment variables in production
if (config.env === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'COOKIE_SECRET',
    'MONGODB_URI'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

module.exports = config;
