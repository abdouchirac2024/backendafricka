const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const Product = require('./models/Product');

dotenv.config();

connectDB().then(async () => {
  // Migration : synchroniser images pour les produits existants
  const toFix = await Product.find({
    $or: [{ images: { $exists: false } }, { images: { $size: 0 } }],
    image: { $ne: '' },
  });
  if (toFix.length > 0) {
    await Promise.all(
      toFix.map((p) => Product.findByIdAndUpdate(p._id, { images: [p.image] }))
    );
    console.log(`Migration: ${toFix.length} produits mis à jour (images synchronisées)`);
  }
});

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Login App' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
