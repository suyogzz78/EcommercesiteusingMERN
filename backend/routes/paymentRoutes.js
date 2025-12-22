const express = require('express');
const router = express.Router();
const {
  verifyPayment,
  getPaymentConfig,
  generateQRData,
  initiateKhaltiPayment,
  paymentWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/config', getPaymentConfig);
router.post('/webhook/:provider', paymentWebhook);

// Protected routes
router.post('/verify', protect, verifyPayment);
router.post('/qr', protect, generateQRData);
router.post('/khalti/initiate', protect, initiateKhaltiPayment);

module.exports = router;