const express = require('express');
const Product = require('../models/Product');
const protect = require('../middleware/auth');

const router = express.Router();

// Synchronise image et images pour compatibilité
const normalizeImages = (body) => {
  if (Array.isArray(body.images) && body.images.length > 0) {
    body.image = body.images[0];
  } else if (body.image && (!body.images || body.images.length === 0)) {
    body.images = [body.image];
  }
  return body;
};

// GET /api/products - public (pagination + filtres + recherche)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    const filter = {};

    if (req.query.category) filter.categorySlug = req.query.category;
    if (req.query.subcategory) filter.subcategorySlug = req.query.subcategory;
    if (req.query.featured === 'true') filter.featured = true;

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
        { subcategory: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };
    const sort = sortMap[req.query.sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    // Normaliser images pour chaque produit retourné
    const normalized = products.map((p) => {
      if ((!p.images || p.images.length === 0) && p.image) {
        p.images = [p.image];
      }
      return p;
    });

    res.json({
      products: normalized,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/products/:id - public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    // Normaliser images
    if ((!product.images || product.images.length === 0) && product.image) {
      product.images = [product.image];
    }
    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de produit invalide' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/products - protégé
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(normalizeImages(req.body));
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Données invalides', error: error.message });
  }
});

// PUT /api/products/:id - protégé
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, normalizeImages(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de mise à jour', error: error.message });
  }
});

// DELETE /api/products/:id - protégé
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
