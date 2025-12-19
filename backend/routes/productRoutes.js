const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} = require('../controllers/productController');

const { protect, admin } = require('../middleware/authMiddleware');


router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/test-simple', (req, res) => {
  console.log('✅ POST /api/products/test-simple');
  console.log('Body:', req.body);
  res.json({ success: true, message: 'Simple POST works' });
});


router.post('/test-protect', protect, (req, res) => {
  console.log('✅ POST /api/products/test-protect');
  console.log('User:', req.user?.email);
  res.json({ 
    success: true, 
    message: 'Protect middleware works',
    user: req.user?.email 
  });
});


router.post('/test-admin', protect, admin, (req, res) => {
  console.log('✅ POST /api/products/test-admin');
  console.log('User:', req.user?.email, 'isAdmin:', req.user?.isAdmin);
  res.json({ 
    success: true, 
    message: 'Admin middleware works',
    user: req.user?.email,
    isAdmin: req.user?.isAdmin
  });
});



router.post('/', protect, admin, createProduct);


router.put('/:id', protect, admin, updateProduct);

module.exports = router;