const Order = require('../models/Order');

// @desc    Generate payment verification
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature, paymentMethod } = req.body;

    // In production, you would verify with Khalti/eSewa API here
    // For now, we'll simulate successful verification
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Mark as paid
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentId,
      status: 'completed',
      update_time: new Date().toISOString(),
    };
    
    if (paymentMethod === 'khalti' || paymentMethod === 'esewa') {
      order.orderStatus = 'processing';
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// @desc    Get payment configuration
// @route   GET /api/payment/config
// @access  Public
const getPaymentConfig = async (req, res) => {
  try {
    const config = {
      khalti: {
        publicKey: process.env.KHALTI_PUBLIC_KEY || 'test_public_key',
        enabled: true,
      },
      esewa: {
        merchantId: process.env.ESEWA_MERCHANT_ID || 'test_merchant',
        enabled: true,
      },
      bankTransfer: {
        enabled: true,
        details: {
          bankName: 'Nepal Investment Mega Bank',
          accountName: 'SportsSphere Nepal',
          accountNumber: '1234567890123',
          branch: 'Kathmandu',
          swiftCode: 'NIMBNPKA',
        },
      },
      cod: {
        enabled: true,
        maxAmount: 20000, // NPR
        charges: 100, // NPR
      },
    };

    res.json(config);
  } catch (error) {
    console.error('Payment config error:', error);
    res.status(500).json({ message: 'Failed to load payment config' });
  }
};

// @desc    Generate payment QR code data
// @route   POST /api/payment/qr
// @access  Private
const generateQRData = async (req, res) => {
  try {
    const { orderId, amount, customerName } = req.body;

    // In production, generate actual QR for bank transfer
    const qrData = {
      type: 'bank_transfer',
      orderId: orderId,
      amount: amount,
      accountNumber: '1234567890123',
      bankName: 'Nepal Investment Mega Bank',
      accountName: 'SportsSphere Nepal',
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      qrData: JSON.stringify(qrData),
      instructions: [
        'Transfer the exact amount to the bank account above',
        'Use Order ID as payment reference',
        'Send payment screenshot to WhatsApp: +977-9800000000',
        'Order will be processed after verification',
      ],
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
};

// @desc    Initiate Khalti payment
// @route   POST /api/payment/khalti/initiate
// @access  Private
const initiateKhaltiPayment = async (req, res) => {
  try {
    const { amount, orderId, customerInfo } = req.body;

    // In production, call Khalti API here
    // For now, return mock response
    
    const mockResponse = {
      pid: `khlt_${Date.now()}`,
      payment_url: `https://khalti.com/payment/${Date.now()}`,
      expires_in: 900, // 15 minutes
      amount: amount,
      order_id: orderId,
    };

    res.json({
      success: true,
      data: mockResponse,
      message: 'Khalti payment initiated',
    });
  } catch (error) {
    console.error('Khalti initiation error:', error);
    res.status(500).json({ message: 'Failed to initiate Khalti payment' });
  }
};

// @desc    Webhook for payment callbacks
// @route   POST /api/payment/webhook/:provider
// @access  Public
const paymentWebhook = async (req, res) => {
  try {
    const { provider } = req.params;
    const payload = req.body;

    console.log(`${provider} webhook received:`, payload);

    // Handle different payment providers
    switch (provider) {
      case 'khalti':
        // Verify Khalti signature
        // Update order status
        break;
      case 'esewa':
        // Verify eSewa signature
        // Update order status
        break;
      default:
        console.log(`Unknown provider: ${provider}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = {
  verifyPayment,
  getPaymentConfig,
  generateQRData,
  initiateKhaltiPayment,
  paymentWebhook,
};