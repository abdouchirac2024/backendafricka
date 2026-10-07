const express = require('express');
const Product = require('../models/Product');
const protect = require('../middleware/auth');

const router = express.Router();

const MAX_PAYLOAD_BYTES = 14 * 1024 * 1024; // limite MongoDB : 16 Mo par document

const toNumOrNull = (v) => {
  const n = Number(v);
  return v === null || v === undefined || v === '' || Number.isNaN(n) || n === 0 ? null : n;
};

// Ne garde que les champs connus, convertit les types et synchronise image/images
const sanitizeProduct = (body = {}) => {
  const out = {};
  ['name', 'category', 'categorySlug', 'subcategory', 'subcategorySlug', 'description'].forEach((k) => {
    if (body[k] !== undefined && body[k] !== null) out[k] = String(body[k]);
  });
  if (body.price !== undefined) out.price = Number(body.price);
  if (body.oldPrice !== undefined) out.oldPrice = toNumOrNull(body.oldPrice);
  if (body.discount !== undefined) out.discount = toNumOrNull(body.discount);
  if (body.featured !== undefined) out.featured = Boolean(body.featured);
  if (body.sizeType !== undefined) out.sizeType = ['pointure', 'taille'].includes(body.sizeType) ? body.sizeType : '';
  if (Array.isArray(body.sizes)) out.sizes = body.sizes.map(String).filter(Boolean);

  let images = Array.isArray(body.images) ? body.images.filter((i) => typeof i === 'string' && i) : null;
  if ((!images || images.length === 0) && typeof body.image === 'string' && body.image) images = [body.image];
  if (images) {
    out.images = images;
    out.image = images[0] || '';
  }
  return out;
};

// Message lisible pour l'utilisateur
const explain = (error, fallback) => {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map((e) => e.message).join(', ');
  }
  if (error.name === 'CastError') return `Valeur invalide pour « ${error.path} »`;
  if (/larger than the maximum|too large|BSON/i.test(error.message)) {
    return 'Images trop volumineuses : supprimez-en ou utilisez des liens (URL)';
  }
  return `${fallback} (${error.message})`;
};

const tooBig = (data) =>
  Buffer.byteLength(JSON.stringify(data.images || [])) > MAX_PAYLOAD_BYTES;

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
    const data = sanitizeProduct(req.body);
    if (tooBig(data)) return res.status(413).json({ message: 'Images trop volumineuses : supprimez-en ou utilisez des liens (URL)' });
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (error) {
    console.error('POST /products', error);
    res.status(400).json({ message: explain(error, 'Données invalides'), error: error.message });
  }
});

// PUT /api/products/:id - protégé
router.put('/:id', protect, async (req, res) => {
  try {
    const data = sanitizeProduct(req.body);
    if (tooBig(data)) return res.status(413).json({ message: 'Images trop volumineuses : supprimez-en ou utilisez des liens (URL)' });
    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    res.json(product);
  } catch (error) {
    console.error('PUT /products/:id', error);
    res.status(400).json({ message: explain(error, 'Erreur de mise à jour'), error: error.message });
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
