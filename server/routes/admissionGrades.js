const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const grades = await collections.admissionGrades()
      .find({ isActive: true })
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ grades });
  } catch (err) {
    console.error('Get admission grades error:', err);
    res.status(500).json({ error: 'Failed to fetch admission grades' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const grades = await collections.admissionGrades()
      .find()
      .sort({ displayOrder: 1 })
      .toArray();
    res.json({ grades });
  } catch (err) {
    console.error('Get admin admission grades error:', err);
    res.status(500).json({ error: 'Failed to fetch admission grades' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { grade, displayOrder } = req.body;

    if (!grade) {
      return res.status(400).json({ error: 'Grade is required' });
    }

    const existing = await collections.admissionGrades().findOne({ grade });
    if (existing) {
      return res.status(400).json({ error: 'Grade already exists' });
    }

    const newGrade = {
      grade,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.admissionGrades().insertOne(newGrade);
    res.json({ success: true, grade: { ...newGrade, _id: result.insertedId } });
  } catch (err) {
    console.error('Create admission grade error:', err);
    res.status(500).json({ error: 'Failed to create admission grade' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, displayOrder, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid grade ID' });
    }
    if (!grade) {
      return res.status(400).json({ error: 'Grade is required' });
    }

    const existing = await collections.admissionGrades().findOne({ 
      grade, 
      _id: { $ne: new ObjectId(id) } 
    });
    if (existing) {
      return res.status(400).json({ error: 'Grade already exists' });
    }

    const updateData = {
      grade,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      updatedAt: new Date()
    };

    await collections.admissionGrades().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const gradeDoc = await collections.admissionGrades().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, grade: gradeDoc });
  } catch (err) {
    console.error('Update admission grade error:', err);
    res.status(500).json({ error: 'Failed to update admission grade' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid grade ID' });
    }

    await collections.admissionGrades().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete admission grade error:', err);
    res.status(500).json({ error: 'Failed to delete admission grade' });
  }
});

module.exports = router;