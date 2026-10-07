const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  media: { type: String, required: [true, 'Le média est requis'] },
  poster: { type: String, default: '' },
  eyebrow: { type: String, default: 'Collection Exclusive', trim: true },
  title: { type: String, default: '', trim: true },
  subtitle: { type: String, default: '', trim: true },
  cta: { type: String, default: 'Découvrir la collection', trim: true },
  link: { type: String, default: '#produits', trim: true },
  duration: { type: Number, default: 8, min: 2, max: 60 },
  transition: { type: String, enum: ['fade', 'slide', 'zoom', 'none'], default: 'fade' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

slideSchema.index({ order: 1 });

module.exports = mongoose.model('Slide', slideSchema);
