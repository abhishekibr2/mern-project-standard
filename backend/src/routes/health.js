/**
 * Health check routes
 * System monitoring and health check endpoints following FANG standards
 */

const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

// Basic health check
router.get('/', healthController.healthCheck);

// Detailed health check
router.get('/detailed', healthController.detailedHealthCheck);

// Kubernetes probes
router.get('/ready', healthController.readiness);
router.get('/live', healthController.liveness);

// Application metrics
router.get('/metrics', healthController.metrics);

module.exports = router;
