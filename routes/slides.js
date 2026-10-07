const express = require('express');
const Slide = require('../models/Slide');
const protect = require('../middleware/auth');

const router = express.Router();

// GET /api/slides - public (actifs) ; ?all=true pour l'admin
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { active: true };
    const slides = await Slide.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PUT /api/slides/reorder - protégé { ids: [...] }  (avant /:id)
router.put('/reorder', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids requis' });
    await Promise.all(ids.map((id, i) => Slide.findByIdAndUpdate(id, { order: i })));
    res.json({ message: 'Ordre mis à jour' });
  } catch (error) {
    res.status(400).json({ message: 'Erreur de réorganisation', error: error.message });
  }
});

// POST /api/slides - protégé
router.post('/', protect, async (req, res) => {
  try {
    const last = await Slide.findOne().sort({ order: -1 }).lean();
    const slide = await Slide.create({ ...req.body, order: last ? last.order + 1 : 0 });
    res.status(201).json(slide);
  } catch (error) {
    res.status(400).json({ message: 'Données invalides', error: error.message });
  }
});

// PUT /api/slides/:id - protégé
router.put('/:id', protect, async (req, res) => {
  try {
    const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slide) return res.status(404).json({ message: 'Slide introuvable' });
    res.json(slide);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de mise à jour', error: error.message });
  }
});

// DELETE /api/slides/:id - protégé
router.delete('/:id', protect, async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide introuvable' });
    res.json({ message: 'Slide supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
