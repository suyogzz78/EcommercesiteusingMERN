import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingCart, Home, Trophy, LogOut } from "lucide-react";
import logo from "../images/logo.png";

const Header = () => {
  const authState = useSelector((state) => state.auth);
  const user = authState?.userInfo?.user || authState?.user?.user || authState?.user || authState;
  const { cartItems } = useSelector((state) => state.cart);

  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src={logo}
              alt="MegaBats"
              className="h-12 w-20 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
                MegaBats
              </h1>
              <p className="text-xs text-gray-500">Premium Cricket Store</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-200 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-amber-600 mr-2" />
            <span className="text-amber-800 font-medium text-sm">
              Premium Cricket Gear
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Home</span>
            </Link>
            <Link
              to="/cart"
              className="relative flex items-center space-x-2 p-2 hover:bg-amber-50 rounded-lg transition-colors group/cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 group-hover/cart:text-amber-600" />
              <span className="hidden sm:inline font-medium">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <div className="h-6 w-px bg-gradient-to-b from-amber-200 to-amber-100"></div>
            
          
            {user?.isAdmin && (
              <div className="flex items-center space-x-2">
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                  Admin
                </div>
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {user?.email ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium hidden md:inline">
                      {user.name || "User"}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">
                      Logout
                    </span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-amber-600 font-medium transition-colors hover:underline hover:underline-offset-4"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;