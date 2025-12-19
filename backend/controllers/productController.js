const Product = require('../models/Product');


const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: products,
    message: 'Products fetched successfully'
  });
});


const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200).json({
    success: true,
    data: product,
    message: 'Product fetched successfully'
  });
});


const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    price,
    category,
    description,
    countInStock,
    image,
    willowType = 'english',
    weight = '2.7',
  } = req.body;

  if (!name || !brand || !price || !category || !description || !countInStock || !image) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const product = await Product.create({
    name,
    brand,
    price,
    category,
    description,
    countInStock,
    image,
    willowType,
    weight,
  });

  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully'
  });
});


const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedProduct,
    message: 'Product updated successfully'
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct
};