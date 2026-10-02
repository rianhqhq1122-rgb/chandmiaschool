const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const activities = await collections.activities()
      .find({ isActive: true })
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ activities });
  } catch (err) {
    console.error('Get activities error:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const activities = await collections.activities()
      .find()
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ activities });
  } catch (err) {
    console.error('Get admin activities error:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.post('/', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { title, description, displayOrder } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const activity = {
      title,
      description: description || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      displayOrder: parseInt(displayOrder) || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.activities().insertOne(activity);
    res.json({ success: true, activity: { ...activity, _id: result.insertedId } });
  } catch (err) {
    console.error('Create activity error:', err);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

router.put('/:id', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, displayOrder, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid activity ID' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const updateData = {
      title,
      description: description || '',
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await collections.activities().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const activity = await collections.activities().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, activity });
  } catch (err) {
    console.error('Update activity error:', err);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid activity ID' });
    }

    await collections.activities().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete activity error:', err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;