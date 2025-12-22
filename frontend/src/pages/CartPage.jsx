import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearCart } from '../features/cartSlice';
import CartItem from '../components/CartItem';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  
  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shipping = subtotal > 5000 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };
  
  const handleProceedToCheckout = () => {
    console.log('🛒 Proceeding to checkout...');
    console.log('📦 Items in cart:', cartItems.length);
    console.log('💰 Total amount:', total);
    
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items to proceed.');
      return;
    }
    
    // Navigate to checkout page
    navigate('/checkout');
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Add some cricket gear to get started!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Browse Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </p>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear All Items
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
            
            {/* Continue Shopping Link */}
            <div className="mt-8">
              <Link
                to="/products"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST 18%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Proceed to Checkout Button - FIXED */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mb-4 active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
              
              {/* Debug info (visible in console only) */}
              <div className="hidden">
                <button 
                  onClick={() => {
                    console.log('🔍 DEBUG INFO:');
                    console.log('Cart items:', cartItems);
                    console.log('Subtotal:', subtotal);
                    console.log('Shipping:', shipping);
                    console.log('Tax:', tax);
                    console.log('Total:', total);
                  }}
                >
                  Debug
                </button>
              </div>
              
              <Link
                to="/"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Add More Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;