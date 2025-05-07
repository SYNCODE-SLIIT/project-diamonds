import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as financeController from '../controllers/financeController.js';

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Protect all routes
router.use(protect);

// Anomaly routes
router.get('/anomalies', financeController.getAnomalies);
router.patch('/anomalies/:id/resolve', financeController.resolveAnomaly);

// Forecast routes
router.get('/forecast', financeController.getForecast);

// 404 handler for finance routes
router.use((req, res) => {
  console.log('404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

export default router; 