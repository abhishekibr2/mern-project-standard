/**
 * Database connection configuration
 * MongoDB connection setup following FANG standards
 */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const dbUri = config.env === 'test' ? config.database.testUri : config.database.uri;

    const conn = await mongoose.connect(dbUri, config.database.options);

    logger.info(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Clear database (for testing purposes)
 */
const clearDB = async () => {
  if (config.env !== 'test') {
    throw new Error('Database clearing is only allowed in test environment');
  }

  try {
    const collections = mongoose.connection.collections;

    await Promise.all(
      Object.values(collections).map(collection => collection.deleteMany({}))
    );

    logger.info('Test database cleared');
  } catch (error) {
    logger.error('Error clearing test database:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  clearDB
};
