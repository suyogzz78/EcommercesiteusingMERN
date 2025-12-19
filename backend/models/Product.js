const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    countInStock: { type: Number, required: true },
    image: { type: String, required: true },
    willowType: { type: String, required: true }, 
    weight: { type: Number, required: true },    
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
