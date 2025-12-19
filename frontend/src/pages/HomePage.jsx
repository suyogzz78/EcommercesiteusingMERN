import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts } from '../features/productSlice';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, isLoading, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-amber-50 via-amber-100 to-amber-200">
  
      <div className="w-full px-4 py-8">
        <div className="max-w-7xl mx-auto">
        
          <div className="relative mb-8">
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-12 bg-blue-600 rounded-full"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 ml-4">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Our Bats
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mt-2 ml-4">
              Premium cricket bats for champions
            </p>
            
           
            <div className="absolute -right-4 top-0">
              <span className="text-4xl opacity-20">🏏</span>
            </div>
          </div>

          
          {!isLoading && !error && (
            <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 px-4 py-2 rounded-full ml-4 mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
              <span className="text-amber-800 font-medium">
                {products.length} Premium Bats Available
              </span>
            </div>
          )}
        </div>
      </div>

    
      <div className="w-full px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <p className="text-red-600 text-center py-8">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;