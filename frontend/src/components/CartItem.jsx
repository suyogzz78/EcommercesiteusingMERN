import React from 'react';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../features/cartSlice';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
    dispatch(removeFromCart(item._id));
  };

  const increaseQty = () => {
    dispatch(updateQuantity({ 
      id: item._id, 
      qty: item.qty + 1 
    }));
  };

  const decreaseQty = () => {
    if (item.qty > 1) {
      dispatch(updateQuantity({ 
        id: item._id, 
        qty: item.qty - 1 
      }));
    } else {
      handleRemove();
    }
  };

  const totalPrice = item.price * item.qty;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors duration-300 bg-white shadow-sm">

      <div className="flex-shrink-0">
        <img
          src={item.image || '/default-bat.jpg'}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
      </div>
      
   
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
        
        {item.brand && (
          <p className="text-sm text-gray-500 mt-1">Brand: {item.brand}</p>
        )}


        <div className="mt-2">
          <p className="text-xl font-bold text-blue-600">₹{item.price}</p>
          {item.originalPrice && item.originalPrice > item.price && (
            <p className="text-sm text-gray-500 line-through">₹{item.originalPrice}</p>
          )}
        </div>
        

        {item.stock && (
          <div className="mt-2">
            {item.stock < 10 ? (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                Only {item.stock} left in stock
              </span>
            ) : (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                In Stock
              </span>
            )}
          </div>
        )}
      </div>
      

      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={decreaseQty}
            className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-50"
            disabled={item.qty <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 w-12 text-center font-medium bg-gray-50">
            {item.qty}
          </span>
          <button
            onClick={increaseQty}
            className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
       
        <div className="text-right min-w-[100px]">
          <p className="text-lg font-bold text-gray-900">
            ₹{totalPrice.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {item.qty} × ₹{item.price}
          </p>
        </div>
        

        <button
          onClick={handleRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
          title="Remove item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;