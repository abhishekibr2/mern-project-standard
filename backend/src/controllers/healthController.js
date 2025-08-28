/**
 * Health check controller
 * System health monitoring endpoints following FANG standards
 */

const mongoose = require('mongoose');
const { catchAsync } = require('../middleware/errorHandler');
const config = require('../config');

/**
 * Basic health check
 */
const healthCheck = catchAsync(async (req, res, next) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.env,
    node: process.version,
    memory: process.memoryUsage(),
    pid: process.pid
  };

  res.status(200).json(healthStatus);
});

/**
 * Detailed health check with dependencies
 */
const detailedHealthCheck = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  // Check database connection
  let dbStatus = 'OK';
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await mongoose.connection.db.admin().ping();
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'ERROR';
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const memoryStatus = memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9 ? 'OK' : 'WARNING';

  // Calculate response time
  const responseTime = Date.now() - startTime;

  const healthStatus = {
    status: dbStatus === 'OK' && memoryStatus === 'OK' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    services: {
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`,
        connection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      },
      memory: {
        status: memoryStatus,
        usage: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          percentage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`
        }
      }
    },
    system: {
      uptime: `${Math.floor(process.uptime())}s`,
      version: process.env.npm_package_version || '1.0.0',
      environment: config.env,
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      cpu: process.cpuUsage()
    }
  };

  const statusCode = healthStatus.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

/**
 * Readiness probe (Kubernetes)
 */
const readiness = catchAsync(async (req, res, next) => {
  try {
    // Check if database is ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'NOT_READY',
        message: 'Database not connected'
      });
    }

    // Check if essential services are ready
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      message: 'Service dependencies not ready',
      error: error.message
    });
  }
});

/**
 * Liveness probe (Kubernetes)
 */
const liveness = catchAsync(async (req, res, next) => {
  // Simple check to see if the application is alive
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Get application metrics
 */
const metrics = catchAsync(async (req, res, next) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    eventLoop: {
      // Note: In production, you might want to use libraries like clinic.js or @nodejs/performance-hooks
      delay: 0 // Placeholder - implement actual event loop delay measurement
    },
    database: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      node: process.version,
      pid: process.pid,
      ppid: process.ppid
    }
  };

  res.status(200).json(metrics);
});

module.exports = {
  healthCheck,
  detailedHealthCheck,
  readiness,
  liveness,
  metrics
};
