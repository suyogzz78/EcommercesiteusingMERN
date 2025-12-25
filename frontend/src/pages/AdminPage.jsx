import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Search,
  Filter,
  Upload,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: "",
    brand: "MRF",
    price: "",
    category: "Cricket Bat",
    description: "",
    countInStock: "",
    image: "",
    willowType: "english",
    weight: "2.7",
    rating: "0",
    numReviews: "0",
  });

  // Get user data ONCE at the beginning
  const getUserData = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  // Initialize with user data
  const userData = getUserData();

  // Fetch products on component mount
  useEffect(() => {
    console.log("🔄 AdminPage mounted");
    console.log("User data:", userData);
    console.log("Is admin:", userData?.user?.isAdmin);
    
    fetchProducts();
    
    // Only fetch these if user is admin
    if (userData?.user?.isAdmin) {
      fetchOrders();
      fetchUsers();
    } else {
      console.log("⚠️ User is not admin, skipping orders/users fetch");
      setMessage({
        text: "Admin access required. Please login as admin.",
        type: "warning"
      });
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/products");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        console.warn("Unexpected API response format:", data);
        setProducts([]);
      }
      
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage({
        text: "Failed to load products. Using mock data.",
        type: "warning"
      });
      // Load mock data for development
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = userData?.token;
      
      if (!token) {
        console.warn("No authentication token found");
        setMessage({
          text: "Please login to access admin features",
          type: "warning"
        });
        return;
      }

      const response = await fetch("http://localhost:5000/api/orders", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Orders response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setMessage({
            text: "Admin access required for orders",
            type: "error"
          });
          setOrders([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error("Error fetching orders:", error);
      setMessage({
        text: "Failed to load orders",
        type: "warning"
      });
      setOrders([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = userData?.token;
      
      if (!token) {
        console.warn("No authentication token found");
        return;
      }

      console.log("🔍 Fetching users with token:", token.substring(0, 20) + "...");

      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Users response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setMessage({
            text: "Admin access required to view users",
            type: "error"
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
        console.log(`✅ Loaded ${data.length} users`);
      } else {
        console.warn("Unexpected response format:", data);
        setUsers([]);
      }
      
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage({
        text: "Failed to load users. Check admin permissions.",
        type: "warning"
      });
      setUsers([]);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = userData?.token;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : "http://localhost:5000/api/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          countInStock: Number(productForm.countInStock),
          rating: Number(productForm.rating),
          numReviews: Number(productForm.numReviews),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to save product: ${response.status}`);
      }

      setMessage({
        text: editingProduct ? "✅ Product updated successfully!" : "✅ Product added successfully!",
        type: "success",
      });

      // Reset form and refresh products
      resetForm();
      fetchProducts();
      
      // Switch to products tab after a delay
      setTimeout(() => {
        setActiveTab("products");
      }, 1500);
      
    } catch (error) {
      setMessage({
        text: `❌ ${error.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      brand: product.brand || "MRF",
      price: product.price?.toString() || "",
      category: product.category || "Cricket Bat",
      description: product.description || "",
      countInStock: product.countInStock?.toString() || "",
      image: product.image || "",
      willowType: product.willowType || "english",
      weight: product.weight || "2.7",
      rating: product.rating?.toString() || "0",
      numReviews: product.numReviews?.toString() || "0",
    });
    setActiveTab("add");
    window.scrollTo(0, 0);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = userData?.token;

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }

      setMessage({
        text: "✅ Product deleted successfully!",
        type: "success",
      });
      
      // Update local state immediately
      setProducts(prev => prev.filter(p => p._id !== productId));
      setDeleteConfirm(null);
      
    } catch (error) {
      setMessage({
        text: `❌ ${error.message}`,
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      brand: "MRF",
      price: "",
      category: "Cricket Bat",
      description: "",
      countInStock: "",
      image: "",
      willowType: "english",
      weight: "2.7",
      rating: "0",
      numReviews: "0",
    });
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value,
    });
  };

  // Mock data for development
  const getMockProducts = () => {
    return [
      {
        _id: "1",
        name: "MRF Genius Grand Edition",
        brand: "MRF",
        price: 12500,
        category: "Cricket Bat",
        countInStock: 15,
        image: "https://images.unsplash.com/photo-1587174486073-ae7c6e5d0c4a?w=400",
        rating: 4.5,
        numReviews: 24,
        willowType: "english",
        weight: "2.8"
      },
      {
        _id: "2",
        name: "Adidas Football",
        brand: "Adidas",
        price: 3500,
        category: "Football",
        countInStock: 8,
        image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400",
        rating: 4.2,
        numReviews: 18,
        weight: "0.45"
      },
      {
        _id: "3",
        name: "SG Cricket Kit Bag",
        brand: "SG",
        price: 2800,
        category: "Accessories",
        countInStock: 25,
        image: "https://images.unsplash.com/photo-1594736797933-d0aab0c7e961?w=400",
        rating: 4.0,
        numReviews: 12
      }
    ];
  };

  // FIX: Ensure products is always an array before filtering
  const safeProducts = Array.isArray(products) ? products : [];
  
  // Filter products based on search
  const filteredProducts = safeProducts.filter(product => {
    if (!product) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower)) ||
      (product.brand && product.brand.toLowerCase().includes(searchLower))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Dashboard Stats
  const stats = {
    totalProducts: safeProducts.length,
    totalOrders: Array.isArray(orders) ? orders.length : 0,
    totalUsers: Array.isArray(users) ? users.length : 0,
    totalRevenue: Array.isArray(orders) ? 
      orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0) : 0,
  };

  // Check if user is admin
  const isAdmin = userData?.user?.isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            {isAdmin ? "Manage your sports equipment store" : "Admin access required"}
          </p>
          
          {!isAdmin && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ You don't have admin privileges. Please login as an administrator.
              </p>
              <button
                onClick={() => window.location.href = "/login"}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Only show admin features if user is admin */}
        {isAdmin ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>
                  <Package className="w-10 h-10 text-blue-500 bg-blue-50 p-2 rounded-full" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <ShoppingBag className="w-10 h-10 text-green-500 bg-green-50 p-2 rounded-full" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-10 h-10 text-purple-500 bg-purple-50 p-2 rounded-full" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">NPR {stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-orange-500 bg-orange-50 p-2 rounded-full" />
                </div>
              </div>
            </div>

            {/* Message Alert */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl border ${
                message.type === "success" 
                  ? "bg-green-50 border-green-200 text-green-700" 
                  : message.type === "warning"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                <div className="flex items-center">
                  {message.type === "success" ? (
                    <Check className="w-5 h-5 mr-2" />
                  ) : message.type === "warning" ? (
                    <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  )}
                  {message.text}
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-2xl shadow-sm p-2">
              <button
                onClick={() => { setActiveTab("products"); resetForm(); }}
                className={`px-6 py-3 rounded-xl font-medium flex items-center transition-all ${
                  activeTab === "products"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Package className="w-5 h-5 mr-2" />
                Products
              </button>
              <button
                onClick={() => { setActiveTab("add"); resetForm(); }}
                className={`px-6 py-3 rounded-xl font-medium flex items-center transition-all ${
                  activeTab === "add"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-3 rounded-xl font-medium flex items-center transition-all ${
                  activeTab === "orders"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-3 rounded-xl font-medium flex items-center transition-all ${
                  activeTab === "users"
                    ? "bg-orange-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Users className="w-5 h-5 mr-2" />
                Users
              </button>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Products Tab */}
              {activeTab === "products" && (
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                      <p className="text-gray-600">Manage your product inventory</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                        />
                      </div>
                      <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filter
                      </button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  ) : (
                    <>
                      {/* Products Table */}
                      {safeProducts.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                          <p className="text-gray-600 mb-6">Add your first product to get started</p>
                          <button
                            onClick={() => setActiveTab("add")}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Product
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedProducts.map((product) => (
                                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <img
                                          src={product.image || "https://via.placeholder.com/150"}
                                          alt={product.name}
                                          className="w-12 h-12 rounded-lg object-cover mr-3"
                                          onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/150";
                                          }}
                                        />
                                        <div>
                                          <div className="font-medium text-gray-900">{product.name}</div>
                                          <div className="text-sm text-gray-500">{product.brand}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                        {product.category}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold">
                                      NPR {product.price?.toLocaleString() || "0"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <span className={`w-3 h-3 rounded-full mr-2 ${
                                          product.countInStock > 10 ? "bg-green-500" : 
                                          product.countInStock > 0 ? "bg-yellow-500" : "bg-red-500"
                                        }`}></span>
                                        {product.countInStock || 0} units
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                        (product.countInStock || 0) > 0
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}>
                                        {(product.countInStock || 0) > 0 ? "In Stock" : "Out of Stock"}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleEditProduct(product)}
                                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
                                        >
                                          <Edit className="w-4 h-4 mr-1" />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirm(product._id)}
                                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
                                        >
                                          <Trash2 className="w-4 h-4 mr-1" />
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                              <div className="text-sm text-gray-700">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
                                {filteredProducts.length} products
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                  disabled={currentPage === 1}
                                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                  Previous
                                </button>
                                <div className="flex items-center">
                                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 mx-1 rounded-lg ${
                                          currentPage === pageNum
                                            ? "bg-blue-600 text-white"
                                            : "border hover:bg-gray-50"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  })}
                                  {totalPages > 5 && <span className="mx-2">...</span>}
                                </div>
                                <button
                                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={currentPage === totalPages}
                                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                  Next
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Add/Edit Product Tab */}
              {activeTab === "add" && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h2>
                    <p className="text-gray-600">
                      {editingProduct ? "Update product details" : "Add a new product to your store"}
                    </p>
                  </div>

                  <form onSubmit={handleProductSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={productForm.name}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            placeholder="Professional Cricket Bat"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand
                          </label>
                          <select
                            name="brand"
                            value={productForm.brand}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="MRF">MRF</option>
                            <option value="SG">SG</option>
                            <option value="SS">SS</option>
                            <option value="Kookaburra">Kookaburra</option>
                            <option value="Adidas">Adidas</option>
                            <option value="Nike">Nike</option>
                            <option value="Puma">Puma</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (NPR) *
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={productForm.price}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            placeholder="2999"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity *
                          </label>
                          <input
                            type="number"
                            name="countInStock"
                            value={productForm.countInStock}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            placeholder="50"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            name="category"
                            value={productForm.category}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Cricket Bat">Cricket Bat</option>
                            <option value="Cricket Ball">Cricket Ball</option>
                            <option value="Football">Football</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Tennis">Tennis</option>
                            <option value="Badminton">Badminton</option>
                            <option value="Sports Wear">Sports Wear</option>
                            <option value="Accessories">Accessories</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Willow Type (For Cricket Bats)
                          </label>
                          <select
                            name="willowType"
                            value={productForm.willowType}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="english">English Willow</option>
                            <option value="kashmir">Kashmir Willow</option>
                            <option value="composite">Composite</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight (kg)
                          </label>
                          <input
                            type="text"
                            name="weight"
                            value={productForm.weight}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="2.7"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating (0-5)
                          </label>
                          <input
                            type="number"
                            name="rating"
                            value={productForm.rating}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            max="5"
                            step="0.1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL *
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          name="image"
                          value={productForm.image}
                          onChange={handleChange}
                          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="https://example.com/product-image.jpg"
                        />
                        <button
                          type="button"
                          className="px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Upload
                        </button>
                      </div>
                      {productForm.image && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <img
                            src={productForm.image}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={productForm.description}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                        required
                        placeholder="Describe the product features, specifications, and benefits..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-semibold flex-1 flex items-center justify-center ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : editingProduct
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white transition-all`}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            {editingProduct ? "Updating..." : "Adding..."}
                          </>
                        ) : editingProduct ? (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Update Product
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 mr-2" />
                            Add Product
                          </>
                        )}
                      </button>
                      
                      {editingProduct && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-6 py-3 border rounded-lg font-semibold hover:bg-gray-50 flex items-center"
                        >
                          <X className="w-5 h-5 mr-2" />
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                    <p className="text-gray-600">View and manage customer orders</p>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600">Orders will appear here when customers make purchases</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order._id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium">Order #{order._id?.slice(-8) || 'N/A'}</div>
                              <div className="text-sm text-gray-600">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date unknown'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">NPR {order.totalPrice?.toLocaleString() || '0'}</div>
                              <div className={`text-sm font-medium ${
                                order.isPaid ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {order.isPaid ? 'Paid' : 'Pending'}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.orderItems?.length || 0} items • {order.shippingAddress?.city || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600">View registered users</p>
                  </div>
                  
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600">User data will appear here when available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.map(user => (
                        <div key={user._id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="font-bold text-blue-600">
                                {user.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                              {user.isAdmin && (
                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          // Non-admin view
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              You need administrator privileges to access this page.
              Please contact your system administrator or login with an admin account.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = "/login"}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-bold">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;