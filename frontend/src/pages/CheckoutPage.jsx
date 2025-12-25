import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { clearCart } from "../features/cartSlice";
import axios from "axios";
import {
  CreditCard,
  Truck,
  MapPin,
  Lock,
  Shield,
  AlertCircle,
  Smartphone,
  Banknote,
  Building,
  Copy,
  Check,
} from "lucide-react";
import {
  saveOrder,
  generateQRData,
  getBankDetails,
  initiateKhaltiPayment,
} from "../api/PaymentService";

const CheckoutPage = () => {
  console.log(
    "AUTH STATE:",
    useSelector((state) => state.auth)
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    district: "",
    province: "",
    paymentMethod: "cod",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrData, setQrData] = useState("");
  const [bankDetails] = useState(getBankDetails());
  const [copied, setCopied] = useState({});
  const [orderCreated, setOrderCreated] = useState(null);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const shipping = subtotal > 10000 ? 0 : 200;
  const tax = subtotal * 0.13;
  const total = Math.round(subtotal + shipping + tax);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
  };

  // ------------------- Payment Handlers -------------------

  const handleCODCheckout = async () => {
    setIsProcessing(true);
    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          province: formData.province,
          country: "Nepal",
        },
        paymentMethod: "cod",
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total,
      };
      const savedOrder = await saveOrder(orderData);
      setOrderCreated(savedOrder);
      dispatch(clearCart());
      navigate(`/order-success/${savedOrder._id}`, {
        state: { order: savedOrder, paymentMethod: "Cash on Delivery" },
      });
    } catch (error) {
      console.error("COD checkout error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKhaltiPayment = async () => {
    setIsProcessing(true);
    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          province: formData.province,
          country: "Nepal",
        },
        paymentMethod: "khalti",
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total,
      };

      const savedOrder = await saveOrder(orderData);
      setOrderCreated(savedOrder);

      const paymentResult = await initiateKhaltiPayment({
        amount: total * 100,
        purchase_order_id: savedOrder._id,
        purchase_order_name: `Sports Equipment Order ${savedOrder._id}`,
        customer_info: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
      });

      if (paymentResult.success) {
        setTimeout(() => {
          dispatch(clearCart());
          navigate(`/order-success/${savedOrder._id}`, {
            state: {
              order: savedOrder,
              paymentMethod: "Khalti",
              transactionId: paymentResult.transaction_id,
            },
          });
        }, 2000);
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Khalti payment error:", error);
      alert("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankTransfer = async () => {
    setIsProcessing(true);
    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          province: formData.province,
          country: "Nepal",
        },
        paymentMethod: "bank_transfer",
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total,
      };
      const savedOrder = await saveOrder(orderData);
      setOrderCreated(savedOrder);

      const qrDataObj = generateQRData(savedOrder._id, total, formData.name);
      setQrData(JSON.stringify(qrDataObj));
      setShowBankDetails(true);
      setShowQRCode(true);
    } catch (error) {
      console.error("Bank transfer error:", error);
      alert("Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.address ||
      !formData.district
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const phoneRegex = /^9[78]\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert(
        "Please enter a valid Nepal phone number (98xxxxxxxx or 97xxxxxxxx)"
      );
      return;
    }

    switch (formData.paymentMethod) {
      case "cod":
        await handleCODCheckout();
        break;
      case "khalti":
        await handleKhaltiPayment();
        break;
      case "bank_transfer":
        await handleBankTransfer();
        break;
      case "esewa":
        await handleEsewaPayment();
        break;
      default:
        alert("Please select a payment method");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checkout
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your purchase</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div>
              {/* Shipping Address Form */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Shipping Address</h2>
                    <p className="text-gray-600 text-sm">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="98xxxxxxxx or 97xxxxxxxx"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District *
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select District</option>
                        <option value="Kathmandu">Kathmandu</option>
                        <option value="Lalitpur">Lalitpur</option>
                        <option value="Bhaktapur">Bhaktapur</option>
                        <option value="Pokhara">Pokhara</option>
                        <option value="Biratnagar">Biratnagar</option>
                        <option value="Birgunj">Birgunj</option>
                        <option value="Butwal">Butwal</option>
                        <option value="Dharan">Dharan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Province *
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Province</option>
                        <option value="1">Province 1</option>
                        <option value="2">Province 2</option>
                        <option value="3">Bagmati</option>
                        <option value="4">Gandaki</option>
                        <option value="5">Lumbini</option>
                        <option value="6">Karnali</option>
                        <option value="7">Sudurpashchim</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Payment Method</h2>
                    <p className="text-gray-600 text-sm">
                      Choose how to pay (Nepal)
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Banknote className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay with cash when you receive
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                        Available
                      </span>
                    </div>
                  </label>
                  
                  {/* Khalti */}
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="khalti"
                      checked={formData.paymentMethod === "khalti"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Smartphone className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="font-medium">Khalti</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay via Khalti Wallet
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                        Popular
                      </span>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === "bank_transfer"}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium">Bank Transfer</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Transfer to our bank account
                      </p>
                    </div>
                  </label>

                  {/* Payment Method Info */}
                  {formData.paymentMethod === "khalti" && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-purple-900 mb-1">
                            Secure Khalti Payment
                          </p>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Nepal's most popular payment wallet</li>
                            <li>• Instant payment confirmation</li>
                            <li>• Supports all Nepali banks</li>
                            <li>• 100% secure and encrypted</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "cod" && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <Truck className="w-5 h-5 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-yellow-900 mb-1">
                            Cash on Delivery
                          </p>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Pay with cash when package arrives</li>
                            <li>• Additional NPR 100 COD charges apply</li>
                            <li>• Available for orders below NPR 20,000</li>
                            <li>• Please keep exact change ready</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "bank_transfer" && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start">
                        <Building className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-900 mb-1">
                            Bank Transfer Instructions
                          </p>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Transfer amount to our bank account</li>
                            <li>• Use Order ID as payment reference</li>
                            <li>• Send payment screenshot to our WhatsApp</li>
                            <li>
                              • Order processed after payment verification
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                {/* Order Items List */}
                <div className="max-h-96 overflow-y-auto mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center py-4 border-b border-gray-100"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">NPR {item.price * item.qty}</p>
                        <p className="text-sm text-gray-600">
                          NPR {item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      NPR {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `NPR ${shipping}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT (13%)</span>
                    <span className="font-medium">NPR {tax.toFixed(2)}</span>
                  </div>
                  {formData.paymentMethod === "cod" && total < 20000 && (
                    <div className="flex justify-between text-yellow-600">
                      <span>COD Charges</span>
                      <span className="font-medium">NPR 100</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-200 flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">
                      NPR{" "}
                      {(formData.paymentMethod === "cod" && total < 20000
                        ? total + 100
                        : total
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">
                        Delivery Information
                      </p>
                      <p className="text-sm text-green-800">
                        • 3-7 business days delivery
                        <br />
                        • Free shipping on orders above NPR 10,000
                        <br />• Track your order via SMS
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer Details Modal */}
                {showBankDetails && orderCreated && (
                  <div className="mb-6 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Bank Transfer Details
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Order ID:</span>
                        <div className="flex items-center">
                          <code className="bg-white px-3 py-1 rounded border">
                            {orderCreated._id}
                          </code>
                          <button
                            onClick={() =>
                              copyToClipboard(orderCreated._id, "orderId")
                            }
                            className="ml-2 p-1 hover:bg-blue-100 rounded"
                          >
                            {copied.orderId ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Amount:</span>
                        <span className="font-bold text-blue-700">
                          NPR {total}
                        </span>
                      </div>

                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Bank Information:
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(bankDetails).map(
                            ([key, value]) =>
                              key !== "qrImage" && (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, " $1")}:
                                  </span>
                                  <div className="flex items-center">
                                    <span className="font-medium">{value}</span>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(value, key)
                                      }
                                      className="ml-2 p-1 hover:bg-gray-100 rounded"
                                    >
                                      {copied[key] ? (
                                        <Check className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )
                          )}
                        </div>
                      </div>

                      {showQRCode && (
                        <div className="mt-4 p-4 bg-white rounded-lg border text-center">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Scan to Pay
                          </h4>
                          <div className="flex justify-center">
                            <div className="p-4 bg-white border rounded-lg">
                              <QRCodeCanvas
                                value={qrData}
                                size={180}
                                level="H"
                                includeMargin={true}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-3">
                            Scan this QR code with your mobile banking app
                          </p>
                        </div>
                      )}

                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <strong>Important:</strong> After payment, please send
                          the transaction screenshot to WhatsApp:
                          +977-9800000000 with your Order ID.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Place Order Button */}
                <div>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center ${
                      isProcessing
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white transition-all duration-300`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-3" />
                        Place Order • NPR{" "}
                        {(formData.paymentMethod === "cod" && total < 20000
                          ? total + 100
                          : total
                        ).toLocaleString()}
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    You'll receive order confirmation via SMS and email
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
