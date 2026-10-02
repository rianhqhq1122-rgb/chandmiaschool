const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const statistics = await collections.statistics()
      .find({ isActive: true })
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ statistics });
  } catch (err) {
    console.error('Get statistics error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const statistics = await collections.statistics()
      .find()
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ statistics });
  } catch (err) {
    console.error('Get admin statistics error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { label, value, displayOrder } = req.body;

    if (!label || !value) {
      return res.status(400).json({ error: 'Label and value are required' });
    }

    const stat = {
      label,
      value,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.statistics().insertOne(stat);
    res.json({ success: true, statistic: { ...stat, _id: result.insertedId } });
  } catch (err) {
    console.error('Create statistic error:', err);
    res.status(500).json({ error: 'Failed to create statistic' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { label, value, displayOrder, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid statistic ID' });
    }
    if (!label || !value) {
      return res.status(400).json({ error: 'Label and value are required' });
    }

    const updateData = {
      label,
      value,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      updatedAt: new Date()
    };

    await collections.statistics().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const statistic = await collections.statistics().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, statistic });
  } catch (err) {
    console.error('Update statistic error:', err);
    res.status(500).json({ error: 'Failed to update statistic' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid statistic ID' });
    }

    await collections.statistics().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete statistic error:', err);
    res.status(500).json({ error: 'Failed to delete statistic' });
  }
});

module.exports = router;