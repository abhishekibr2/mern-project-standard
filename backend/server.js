/**
 * Main server entry point
 * MERN Backend following FANG standards
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import configurations and middleware
const config = require('./src/config');
const logger = require('./src/utils/logger');
const { connectDB } = require('./src/config/database');
const { globalErrorHandler } = require('./src/middleware/errorHandler');
const notFound = require('./src/middleware/notFound');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const healthRoutes = require('./src/routes/health');

const app = express();
const PORT = process.env.PORT || config.port || 5000;

// Add global error handlers BEFORE anything else
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server function
async function startServer() {
  try {
    // Connect to database with error handling
    console.log('Hello 1');
    console.log('Connecting to database...');
    await connectDB();
    console.log('Hello 3');
    console.log('Database connected successfully');

    // Trust proxy for rate limiting behind reverse proxy
    app.set('trust proxy', 1);

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      optionsSuccessStatus: 200
    }));

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser());

    // Compression middleware
    app.use(compression());

    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    } else {
      app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
    }

    // Apply rate limiting
    app.use(limiter);

    // Health check endpoint (before other routes)
    app.use('/api/health', healthRoutes);

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({
        message: 'MERN Backend API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    app.use(notFound);

    // Error handling middleware (must be last)
    app.use(globalErrorHandler);

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, shutting down gracefully');
      console.log('Received shutdown signal, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        console.log('Process terminated');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;