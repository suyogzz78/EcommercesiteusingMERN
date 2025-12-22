import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ShoppingBag } from 'lucide-react';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { order, paymentMethod, transactionId } = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-600">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-3 text-blue-600" />
                Order Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono font-bold text-lg">{id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString('en-NP')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium">{paymentMethod || 'Cash on Delivery'}</p>
                </div>
                
                {transactionId && (
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono font-medium">{transactionId}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-medium">3-7 business days</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Truck className="w-6 h-6 mr-3 text-green-600" />
                Next Steps
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-sm text-gray-600">We're preparing your order</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Shipping</p>
                    <p className="text-sm text-gray-600">We'll ship within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-sm text-gray-600">Track via SMS/Email</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="font-bold text-blue-600">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Support</p>
                    <p className="text-sm text-gray-600">Contact: +977-9800000000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="tel:+9779800000000" 
                className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100"
              >
                <p className="font-medium">Call Support</p>
                <p className="text-sm text-gray-600">+977-9800000000</p>
              </a>
              
              <a 
                href="https://wa.me/9779800000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100"
              >
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-gray-600">Chat with us</p>
              </a>
              
              <Link 
                to="/orders" 
                className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100"
              >
                <p className="font-medium">View Orders</p>
                <p className="text-sm text-gray-600">Track all orders</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;