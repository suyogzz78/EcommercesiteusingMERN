import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Save order to database
const getToken = () => {
  // Try different storage formats
  
  // 1. Check if token is stored directly
  const tokenDirect = localStorage.getItem('token');
  if (tokenDirect) return tokenDirect;
  
  // 2. Check if userInfo object is stored
  const userInfo = localStorage.getItem('user');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      if (parsed.token) return parsed.token;
      if (parsed.accessToken) return parsed.accessToken;
    } catch (e) {
      console.error('Error parsing userInfo:', e);
    }
  }
  
  // 3. Check auth state (if using Redux)
  // This would be passed from component
  
  return null;
};

// Save order to database
export const saveOrder = async (orderData) => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving order:', error.response?.status, error.response?.data);
    
    // Enhanced error handling
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    
    throw error;
  }
};

// Generate payment QR code data
export const generateQRData = (orderId, amount, name = 'Customer') => {
  return {
    amount: amount,
    orderId: orderId,
    name: name,
    timestamp: new Date().toISOString()
  };
};

// Get bank details
export const getBankDetails = () => {
  return {
    bankName: 'Nepal Investment Mega Bank',
    accountName: 'SportsSphere Nepal',
    accountNumber: '1234567890123',
    branch: 'Kathmandu',
    swiftCode: 'NIMBNPKA',
    qrImage: '/api/payment/qr-bank.png' // You can add QR image
  };
};

// Mock Khalti payment (In real app, integrate with Khalti API)
export const initiateKhaltiPayment = async (paymentData) => {
  // This is a mock implementation
  // In real app, you would call Khalti API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        payment_id: `khlt_${Date.now()}`,
        transaction_id: `txn_${Date.now()}`,
        amount: paymentData.amount,
        status: 'completed'
      });
    }, 1500);
  });
};

// Generate receipt
export const generateReceipt = (order) => {
  return {
    orderId: order._id,
    date: new Date().toLocaleDateString('en-NP'),
    items: order.orderItems,
    total: order.totalPrice,
    paymentMethod: order.paymentMethod,
    status: 'pending'
  };
};