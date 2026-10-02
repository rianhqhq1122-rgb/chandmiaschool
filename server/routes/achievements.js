const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

const CATEGORIES = ['Academic', 'Sports', 'Debate', 'Science', 'Cultural', 'Other'];

router.get('/public', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const achievements = await collections.achievements()
      .find(filter)
      .sort({ year: -1, displayOrder: 1 })
      .toArray();
    res.json({ achievements, categories: CATEGORIES });
  } catch (err) {
    console.error('Get achievements error:', err);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const achievements = await collections.achievements()
      .find()
      .sort({ year: -1, displayOrder: 1 })
      .toArray();
    res.json({ achievements, categories: CATEGORIES });
  } catch (err) {
    console.error('Get admin achievements error:', err);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

router.post('/', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { title, description, year, category, displayOrder } = req.body;

    if (!title || !year || !category) {
      return res.status(400).json({ error: 'Title, year, and category are required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const achievement = {
      title,
      description: description || '',
      year: parseInt(year),
      category,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      displayOrder: parseInt(displayOrder) || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.achievements().insertOne(achievement);
    res.json({ success: true, achievement: { ...achievement, _id: result.insertedId } });
  } catch (err) {
    console.error('Create achievement error:', err);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
});

router.put('/:id', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, year, category, displayOrder, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid achievement ID' });
    }
    if (!title || !year || !category) {
      return res.status(400).json({ error: 'Title, year, and category are required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const updateData = {
      title,
      description: description || '',
      year: parseInt(year),
      category,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await collections.achievements().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const achievement = await collections.achievements().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, achievement });
  } catch (err) {
    console.error('Update achievement error:', err);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid achievement ID' });
    }

    await collections.achievements().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete achievement error:', err);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

module.exports = router;