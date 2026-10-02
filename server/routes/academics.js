const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const academics = await collections.academics()
      .find({ isActive: true })
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ academics });
  } catch (err) {
    console.error('Get academics error:', err);
    res.status(500).json({ error: 'Failed to fetch academics' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const academics = await collections.academics()
      .find()
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ academics });
  } catch (err) {
    console.error('Get admin academics error:', err);
    res.status(500).json({ error: 'Failed to fetch academics' });
  }
});

router.post('/', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { subject, description, teacher, class: className, displayOrder } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const academic = {
      subject,
      description: description || '',
      teacher: teacher || '',
      class: className || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      displayOrder: parseInt(displayOrder) || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.academics().insertOne(academic);
    res.json({ success: true, academic: { ...academic, _id: result.insertedId } });
  } catch (err) {
    console.error('Create academic error:', err);
    res.status(500).json({ error: 'Failed to create academic' });
  }
});

router.put('/:id', requireAdmin, upload.single('image'), handleUploadError, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, teacher, class: className, displayOrder, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid academic ID' });
    }
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const updateData = {
      subject,
      description: description || '',
      teacher: teacher || '',
      class: className || '',
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await collections.academics().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const academic = await collections.academics().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, academic });
  } catch (err) {
    console.error('Update academic error:', err);
    res.status(500).json({ error: 'Failed to update academic' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid academic ID' });
    }

    await collections.academics().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete academic error:', err);
    res.status(500).json({ error: 'Failed to delete academic' });
  }
});

module.exports = router;