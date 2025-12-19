// frontend/src/pages/ProductPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cartSlice';
import { fetchProductById } from '../api/productService';
import { 
  Star, 
  Truck, 
  Shield, 
  Check, 
  ChevronLeft,
  Package,
  ArrowRight,
  Heart,
  Share2,
  Tag,
  Zap,
  ShoppingBag
} from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  const handleAddToCart = () => {
    setIsAdding(true);
    dispatch(addToCart({ ...product, qty: quantity }));
    
    setTimeout(() => {
      setIsAdding(false);
      alert(`${product.name} added to cart!`);
    }, 500);
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, qty: quantity }));
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">😔</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
     
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-amber-600 font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          
          <div className="space-y-6">
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto max-h-[500px] object-contain"
              />
            </div>

           
            <div className="flex flex-wrap gap-3">
              {product.brand && (
                <span className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold border border-blue-200">
                  {product.brand}
                </span>
              )}
              {product.willowType && (
                <span className="bg-gradient-to-r from-green-50 to-green-100 text-green-800 px-4 py-2 rounded-full font-semibold border border-green-200">
                  {product.willowType}
                </span>
              )}
              {product.weight && (
                <span className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold border border-purple-200">
                  {product.weight}g
                </span>
              )}
            </div>
          </div>

         
          <div className="space-y-6">
           
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-2 rounded-full">
                  <div className="flex text-amber-500 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < 4 ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-amber-800">4.5 (124 reviews)</span>
                </div>
              </div>

            
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="ml-4 text-xl text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                
                
                <div className="flex items-center">
                  {product.countInStock > 10 ? (
                    <span className="inline-flex items-center text-green-600 font-medium">
                      <Check className="w-5 h-5 mr-2" />
                      In Stock • {product.countInStock} units available
                    </span>
                  ) : product.countInStock > 0 ? (
                    <span className="inline-flex items-center text-amber-600 font-medium">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                      Only {product.countInStock} left in stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>
              </div>
            </div>

           
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Brand</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                {product.willowType && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Willow Type</span>
                    <span className="font-medium">{product.willowType}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium">{product.weight}g</span>
                  </div>
                )}
              </div>
            </div>

   
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-l-lg bg-white hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <span className="text-xl font-bold">−</span>
                  </button>
                  <div className="w-20 h-12 flex items-center justify-center border-t border-b border-gray-300 bg-white text-lg font-bold">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-r-lg bg-white hover:bg-gray-50"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                  <div className="ml-4 text-sm text-gray-600">
                    <Package className="inline w-4 h-4 mr-2" />
                    {product.countInStock} available
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.countInStock === 0}
                  className={`w-full py-4 rounded-lg font-bold flex items-center justify-center transition-all ${
                    isAdding
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : product.countInStock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-xl'
                  }`}
                >
                  {isAdding ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Adding to Cart...
                    </>
                  ) : product.countInStock === 0 ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 mr-3" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.countInStock === 0}
                  className={`w-full py-4 rounded-lg font-bold flex items-center justify-center border-2 transition-all ${
                    product.countInStock === 0
                      ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                      : 'border-amber-500 text-amber-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:border-amber-600 hover:text-amber-700'
                  }`}
                >
                  <Zap className="w-5 h-5 mr-3" />
                  Buy Now
                </button>
              </div>

            
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Free Shipping</p>
                    <p className="text-xs text-gray-600">On orders over ₹5000</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Authentic Guarantee</p>
                    <p className="text-xs text-gray-600">100% genuine products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;