
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from '../features/cartSlice';
import { ShoppingBag, Zap, Eye, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    navigate('/cart');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    dispatch(addToCart(product));
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-amber-400 hover:border-2"> {/* Golden border on hover */}
    
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-100 to-gray-50 h-52"> 
        <Link to={`/product/${product._id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110" 
          />
        </Link>
        
       
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
          <Link 
            to={`/product/${product._id}`}
            className="w-full p-4 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
          >
            <button className="w-full bg-gradient-to-r from-amber-50 to-white text-amber-900 font-semibold py-3 px-4 rounded-lg flex items-center justify-center hover:from-amber-100 hover:to-white shadow-md">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
          </Link>
        </div>
        
     
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
              NEW
            </span>
          )}
          {product.discount && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
              -{product.discount}% OFF
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4"> 
        <Link to={`/product/${product._id}`}>
          <h3 className="font-bold text-base text-gray-900 line-clamp-2 h-12 mb-2 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        
        {product.brand && (
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            {product.brand}
          </p>
        )}
        
       
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-gray-900">₹{product.price}</p> 
            {product.originalPrice && (
              <p className="text-sm text-gray-500 line-through">₹{product.originalPrice}</p>
            )}
          </div>
          
         
          {product.rating && (
            <div className="flex items-center bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
              <span className="text-sm font-bold text-amber-700">{product.rating}</span>
            </div>
          )}
        </div>
        
        
        {product.category && (
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 text-xs rounded-full border border-amber-200 mb-3">
            {product.category}
          </span>
        )}
        
      
        {product.stock && (
          <div className="mb-3">
            {product.stock <= 5 && product.stock > 0 ? (
              <span className="inline-flex items-center text-xs font-medium bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                Only {product.stock} left
              </span>
            ) : product.stock === 0 ? (
              <span className="inline-flex items-center text-xs font-medium bg-gradient-to-r from-red-100 to-red-50 text-red-800 px-3 py-1 rounded-full">
                Out of stock
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-3 py-1 rounded-full">
                In Stock
              </span>
            )}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || (product.stock === 0)}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center transition-all duration-300 ${
              isAdding 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-lg'
            }`}
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : product.stock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center border-2 transition-all duration-300 ${
              product.stock === 0
                ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                : 'border-amber-500 text-amber-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:border-amber-600 hover:text-amber-700'
            }`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;