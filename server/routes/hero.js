const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const slides = await collections.heroSlides()
      .find({ isActive: true })
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ slides });
  } catch (err) {
    console.error('Get hero slides error:', err);
    res.status(500).json({ error: 'Failed to fetch hero slides' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const slides = await collections.heroSlides()
      .find()
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ slides });
  } catch (err) {
    console.error('Get admin hero slides error:', err);
    res.status(500).json({ error: 'Failed to fetch hero slides' });
  }
});

router.post('/', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonLink, displayOrder, isActive } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const slide = {
      title,
      subtitle: subtitle || '',
      description: description || '',
      buttonText: buttonText || '',
      buttonLink: buttonLink || '',
      image: `/uploads/${req.file.filename}`,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.heroSlides().insertOne(slide);
    res.json({ success: true, slide: { ...slide, _id: result.insertedId } });
  } catch (err) {
    console.error('Create hero slide error:', err);
    res.status(500).json({ error: 'Failed to create hero slide' });
  }
});

router.put('/:id', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, buttonText, buttonLink, displayOrder, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid slide ID' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const updateData = {
      title,
      subtitle: subtitle || '',
      description: description || '',
      buttonText: buttonText || '',
      buttonLink: buttonLink || '',
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await collections.heroSlides().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const slide = await collections.heroSlides().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, slide });
  } catch (err) {
    console.error('Update hero slide error:', err);
    res.status(500).json({ error: 'Failed to update hero slide' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid slide ID' });
    }

    await collections.heroSlides().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete hero slide error:', err);
    res.status(500).json({ error: 'Failed to delete hero slide' });
  }
});

router.put('/reorder', requireAdmin, async (req, res) => {
  try {
    const { slides } = req.body;
    
    if (!Array.isArray(slides)) {
      return res.status(400).json({ error: 'Slides array required' });
    }

    const bulkOps = slides.map((slide, index) => ({
      updateOne: {
        filter: { _id: new ObjectId(slide._id) },
        update: { $set: { displayOrder: index, updatedAt: new Date() } }
      }
    }));

    if (bulkOps.length > 0) {
      await collections.heroSlides().bulkWrite(bulkOps);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Reorder hero slides error:', err);
    res.status(500).json({ error: 'Failed to reorder slides' });
  }
});

module.exports = router;