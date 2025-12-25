const Order = require('../models/Order');
const axios = require('axios');

const verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature, paymentMethod } = req.body;

 
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }


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
        sandbox: true, 
        sandboxUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        sandboxMerchantCode: 'EPAYTEST',
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


const initiateEsewaPayment = async (req, res) => {
  try {
    const { orderId, amt, tax, shipping, discount, customerInfo } = req.body;

    const tAmt = amt + tax + shipping + (discount || 0);
    
    // Get environment URLs
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const esewaMerchantCode = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';

    res.json({
      success: true,
      url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      method: "POST",
      params: {
        amount: tAmt.toString(),
        tax_amount: tax.toString(),
        service_charge: shipping.toString(),
        delivery_charge: (discount || 0).toString(),
        total_amount: tAmt.toString(),
        transaction_uuid: orderId,
        product_code: esewaMerchantCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${backendUrl}/api/payment/esewa/success?orderId=${orderId}`,
        failure_url: `${backendUrl}/api/payment/esewa/failure?orderId=${orderId}`,
        signed_field_names: "total_amount,transaction_uuid,product_code"
      },
      orderId: orderId,
      amount: tAmt
    });
  } catch (error) {
    console.error('eSewa initiation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate eSewa payment' 
    });
  }
};


const handleEsewaSuccess = async (req, res) => {
  try {
    console.log('eSewa Success Callback Received:', req.query);
    
    const { 
      data: encryptedData, // eSewa sends encrypted data
      orderId, // Your custom orderId
      transaction_uuid, // Same as orderId
      transaction_code, // eSewa's transaction code
      status, // Status from eSewa
      amount, // Paid amount
      product_code // Merchant code
    } = req.query;

    if (!orderId && transaction_uuid) {
      orderId = transaction_uuid; // Use transaction_uuid as orderId
    }

    console.log(`Processing eSewa success for order: ${orderId}`);
    console.log(`Transaction Code: ${transaction_code}`);

    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error(`Order ${orderId} not found in database`);
      // Still redirect to frontend with error
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${orderId}?payment=esewa&status=notfound`);
    }

    // For sandbox testing, we can skip verification
    // In production, you MUST verify with eSewa API
    const isSandbox = product_code === 'EPAYTEST';
    
    let verificationSuccess = isSandbox; // Auto-success in sandbox
    
    if (!isSandbox && transaction_code) {
      // Production verification with eSewa API
      try {
        const verificationResponse = await axios.get(
          `https://epay.esewa.com.np/api/epay/v1/transaction/status/?product_code=${product_code}&transaction_code=${transaction_code}`,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        verificationSuccess = verificationResponse.data.status === 'COMPLETE';
        console.log('eSewa Verification Result:', verificationResponse.data);
      } catch (verifyError) {
        console.error('eSewa verification failed:', verifyError);
        verificationSuccess = false;
      }
    }

    if (verificationSuccess) {
      // Update order payment status
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: transaction_code || `esewa_${Date.now()}`,
        status: 'completed',
        update_time: new Date().toISOString(),
        provider: 'esewa',
        amount: amount || order.totalPrice
      };
      order.orderStatus = 'processing';
      
      await order.save();
      console.log(`Order ${orderId} marked as paid via eSewa`);

      // Redirect to frontend success page
      const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${orderId}?payment=esewa&status=success${transaction_code ? `&transaction_code=${transaction_code}` : ''}`;
      console.log('Redirecting to:', redirectUrl);
      return res.redirect(redirectUrl);
    } else {
      console.log(`eSewa payment verification failed for order: ${orderId}`);
      
      // Update order as payment failed
      order.paymentResult = {
        status: 'failed',
        update_time: new Date().toISOString(),
        provider: 'esewa',
        failure_reason: 'Verification failed'
      };
      await order.save();
      
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${orderId}?payment=esewa&status=failed`);
    }
  } catch (error) {
    console.error('eSewa Success Callback Error:', error);
    // Still redirect to order page but with error status
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${req.query.orderId || 'unknown'}?payment=esewa&status=error`);
  }
};

// @desc    Handle eSewa failure callback
// @route   GET /api/payment/esewa/failure
// @access  Public (Called by eSewa)
const handleEsewaFailure = async (req, res) => {
  try {
    console.log('eSewa Failure Callback Received:', req.query);
    
    const { 
      data: encryptedData,
      orderId,
      transaction_uuid,
      reason
    } = req.query;

    const actualOrderId = orderId || transaction_uuid;
    
    if (actualOrderId) {
      console.log(`Updating order ${actualOrderId} as payment failed`);
      
      // Find and update order
      const order = await Order.findById(actualOrderId);
      if (order) {
        order.paymentResult = {
          status: 'failed',
          update_time: new Date().toISOString(),
          provider: 'esewa',
          failure_reason: reason || 'User cancelled payment'
        };
        await order.save();
      }
    }

    // Redirect back to checkout with error
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout?payment=failed&method=esewa${actualOrderId ? `&orderId=${actualOrderId}` : ''}`;
    console.log('Redirecting to:', redirectUrl);
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('eSewa Failure Callback Error:', error);
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout?payment=failed&method=esewa`);
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
        console.log('Khalti webhook processing');
        break;
      case 'esewa':
        // Verify eSewa signature
        // Update order status
        console.log('eSewa webhook processing');
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

// @desc    Mock eSewa payment for testing
// @route   POST /api/payment/esewa/mock
// @access  Private (for development only)
const mockEsewaPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Mock successful payment
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: `mock_esewa_${Date.now()}`,
      status: 'completed',
      update_time: new Date().toISOString(),
      provider: 'esewa'
    };
    order.orderStatus = 'processing';
    
    await order.save();

    res.json({
      success: true,
      message: 'Mock eSewa payment processed',
      order: order,
      redirectUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${orderId}?payment=esewa&status=success&mock=true`
    });
  } catch (error) {
    console.error('Mock eSewa error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Mock payment failed' 
    });
  }
};

module.exports = {
  verifyPayment,
  getPaymentConfig,
  generateQRData,
  initiateKhaltiPayment,
  initiateEsewaPayment,
  handleEsewaSuccess,    // ADD THIS
  handleEsewaFailure,    // ADD THIS
  mockEsewaPayment,      // ADD THIS (optional)
  paymentWebhook,
};