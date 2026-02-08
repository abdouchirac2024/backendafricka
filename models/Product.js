const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
  },
  category: {
    type: String,
    default: '',
  },
  categorySlug: {
    type: String,
    default: '',
  },
  subcategory: {
    type: String,
    default: '',
  },
  subcategorySlug: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: 0,
  },
  oldPrice: {
    type: Number,
    default: null,
  },
  discount: {
    type: Number,
    default: null,
  },
  image: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
