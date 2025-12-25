// In paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  verifyPayment,
  getPaymentConfig,
  generateQRData,
  initiateKhaltiPayment,
  initiateEsewaPayment,
  handleEsewaSuccess,    // Add this
  handleEsewaFailure,    // Add this
  mockEsewaPayment,      // Add this (optional)
  paymentWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// ------------------- Public Routes -------------------
router.get('/config', getPaymentConfig);
router.post('/webhook/:provider', paymentWebhook);

// eSewa Callback Routes (MUST be public)
router.get('/esewa/success', handleEsewaSuccess);
router.get('/esewa/failure', handleEsewaFailure);

// Mock route for testing (remove in production)
router.post('/esewa/mock', protect, mockEsewaPayment);

// ------------------- Protected Routes -------------------
router.post('/verify', protect, verifyPayment);
router.post('/qr', protect, generateQRData);
router.post('/khalti/initiate', protect, initiateKhaltiPayment);
router.post('/esewa/initiate', protect, initiateEsewaPayment);

module.exports = router;