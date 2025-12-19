import React, { useState } from "react";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
  });

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
     
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData?.token;

      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          countInStock: Number(productForm.countInStock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      setMessage("✅ Product added successfully!");


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
      });
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Add and manage products</p>
        </div>


        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "add"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            ➕ Add Product
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "manage"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            📦 Manage Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            📋 View Orders
          </button>
        </div>

      
        {message && (
          <div
            className={`p-4 mb-6 rounded-lg ${
              message.includes("✅")
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === "add" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Add New Product</h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                      placeholder="Cricket Bat"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={productForm.brand}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="MRF"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                      placeholder="2999"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      name="countInStock"
                      value={productForm.countInStock}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Category</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Cricket Bat">Cricket Gear</option>
                      <option value="football">Football</option>
                      <option value="accessories">Accessories</option>
                      <option value="clothing">Clothing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Willow Type</label>
                    <select
                      name="willowType"
                      value={productForm.willowType}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="english">English Willow</option>
                      <option value="kashmir">Kashmir Willow</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2">Image URL *</label>
                  <input
                    type="text"
                    name="image"
                    value={productForm.image}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                    placeholder="Describe the product..."
                  />
                </div>
                
                <div>
                  <label className="block mb-2">Weight (kg)</label>
                  <input
                    type="text"
                    name="weight"
                    value={productForm.weight}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="2.7"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-bold ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loading ? "Adding Product..." : "Add Product to Store"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "manage" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Manage Products</h2>
              <p className="text-gray-600">View, edit, and delete products.</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">Feature in development...</p>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Order Management</h2>
              <p className="text-gray-600">View and manage customer orders.</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">Feature in development...</p>
              </div>
            </div>
          )}
        </div>

    
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => (window.location.href = "/products")}
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="font-medium">View Store</div>
              <div className="text-sm text-gray-500">
                See products as customers
              </div>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.parse(localStorage.getItem("user"))?.token || "No token"
                );
                alert("Token copied");
              }}
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="font-medium">Copy Token</div>
              <div className="text-sm text-gray-500">For API testing</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;