const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  {
    name: "Sac Bandoulière Wax Luxe",
    category: "Africa Market Bags",
    categorySlug: "africa-market-bags",
    subcategory: "Sac bandoulière",
    subcategorySlug: "sac-bandouliere",
    price: 79500,
    oldPrice: 89500,
    discount: 15,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    description: "Sac bandoulière en tissu wax authentique avec finitions cuir premium. Doublure intérieure soie.",
    featured: true,
  },
  {
    name: "Sac à Main Bogolan",
    category: "Africa Market Bags",
    categorySlug: "africa-market-bags",
    subcategory: "Sac à main",
    subcategorySlug: "sac-a-main",
    price: 95000,
    oldPrice: 110000,
    discount: 14,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    description: "Sac à main en bogolan malien fait main. Cuir tanné végétal et teintures naturelles.",
    featured: true,
  },
  {
    name: "Clutch Soirée Cuir",
    category: "Africa Market Bags",
    categorySlug: "africa-market-bags",
    subcategory: "Pochette",
    subcategorySlug: "pochette",
    price: 68500,
    oldPrice: 78000,
    discount: 12,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
    description: "Pochette de soirée en cuir grainé africain. Fermoir magnétique doré. Chaîne amovible.",
    featured: true,
  },
  {
    name: "Sac à Dos Kente Premium",
    category: "Africa Market Bags",
    categorySlug: "africa-market-bags",
    subcategory: "Sac à dos LV",
    subcategorySlug: "sac-dos-lv",
    price: 112000,
    oldPrice: 135000,
    discount: 17,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    description: "Sac à dos en tissu kente ghanéen tissé main. Compartiment laptop 15 pouces. Cuir pleine fleur.",
    featured: true,
  },
  {
    name: "Mini Sac Sport",
    category: "Africa Market Bags",
    categorySlug: "africa-market-bags",
    subcategory: "Sac à dos Sport",
    subcategorySlug: "sac-dos-sport",
    price: 39500,
    oldPrice: 45000,
    discount: 12,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    description: "Mini sac sport en toile wax imperméable. Parfait pour le quotidien. Léger et résistant.",
    featured: false,
  },
  {
    name: "Sac Voyage XL",
    category: "Africa Market Bags",
    categorySlug: "africa-market-bags",
    subcategory: "Colis léger",
    subcategorySlug: "colis-leger",
    price: 145000,
    oldPrice: 175000,
    discount: 17,
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80",
    description: "Sac de voyage XL en cuir et wax. Grande capacité 45L. Bandoulière ajustable.",
    featured: false,
  },
  {
    name: "Sandales Cuir Chèvre",
    category: "Accessoires",
    categorySlug: "accessoires",
    subcategory: "Chaussures Hommes",
    subcategorySlug: "chaussures-hommes",
    price: 45000,
    oldPrice: 55000,
    discount: 18,
    image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
    description: "Sandales artisanales en cuir de chèvre tanné naturel. Semelle confort. Fabriquées au Cameroun.",
    sizeType: "pointure",
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    featured: true,
  },
  {
    name: "Baskets Wax",
    category: "Accessoires",
    categorySlug: "accessoires",
    subcategory: "Chaussures Hommes",
    subcategorySlug: "chaussures-hommes",
    price: 62500,
    oldPrice: 72000,
    discount: 13,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
    description: "Baskets urbaines avec empiècements wax africain. Semelle en caoutchouc naturel. Unisexe.",
    sizeType: "pointure",
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    featured: true,
  },
  {
    name: "Escarpins Cuir",
    category: "Accessoires",
    categorySlug: "accessoires",
    subcategory: "Chaussures Femmes",
    subcategorySlug: "chaussures-femmes",
    price: 78000,
    oldPrice: 92000,
    discount: 15,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    description: "Escarpins en cuir véritable avec détails wax. Talon 8cm confort. Intérieur cuir.",
    sizeType: "pointure",
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    featured: true,
  },
  {
    name: "Oud Africain 100ml",
    category: "Cadeaux Événement",
    categorySlug: "cadeaux",
    subcategory: "Cadeau pour lui",
    subcategorySlug: "cadeau-pour-lui",
    price: 35000,
    oldPrice: 42000,
    discount: 17,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
    description: "Eau de parfum Oud africain. Notes de bois précieux, ambre et musc. Longue tenue 12h.",
    featured: true,
  },
  {
    name: "Ylang-Ylang 50ml",
    category: "Cadeaux Événement",
    categorySlug: "cadeaux",
    subcategory: "Cadeau pour elle",
    subcategorySlug: "cadeau-pour-elle",
    price: 28500,
    oldPrice: 34000,
    discount: 16,
    image: "https://images.unsplash.com/photo-1594035910387-fbd1a485b12e?w=800&q=80",
    description: "Parfum floral Ylang-Ylang de Madagascar. Notes de jasmin, vanille et bois de santal.",
    featured: true,
  },
  {
    name: "Baobab Épices 100ml",
    category: "Cadeaux Événement",
    categorySlug: "cadeaux",
    subcategory: "Cadeau pour lui",
    subcategorySlug: "cadeau-pour-lui",
    price: 42000,
    oldPrice: 50000,
    discount: 16,
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
    description: "Eau de parfum boisé-épicé. Notes de baobab, poivre de Penja et cardamome. Flacon artisanal.",
    featured: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');
    await Product.deleteMany({});
    console.log('Anciens produits supprimés');
    await Product.insertMany(products);
    console.log('12 produits insérés avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
};

seed();
