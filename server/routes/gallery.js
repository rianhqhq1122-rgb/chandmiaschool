const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

const CATEGORIES = ['Campus', 'Classrooms', 'Students', 'Teachers', 'Sports', 'Events', 'Cultural', 'Other'];

router.get('/public', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const images = await collections.gallery()
      .find(filter)
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ images, categories: CATEGORIES });
  } catch (err) {
    console.error('Get gallery error:', err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const images = await collections.gallery()
      .find()
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ images, categories: CATEGORIES });
  } catch (err) {
    console.error('Get admin gallery error:', err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

router.post('/', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { title, category, displayOrder } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const image = {
      title,
      category,
      url: `/uploads/${req.file.filename}`,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.gallery().insertOne(image);
    res.json({ success: true, image: { ...image, _id: result.insertedId } });
  } catch (err) {
    console.error('Create gallery image error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.put('/:id', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, displayOrder, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid image ID' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const updateData = {
      title,
      category,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.url = `/uploads/${req.file.filename}`;
    }

    await collections.gallery().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const image = await collections.gallery().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, image });
  } catch (err) {
    console.error('Update gallery image error:', err);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    await collections.gallery().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete gallery image error:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;