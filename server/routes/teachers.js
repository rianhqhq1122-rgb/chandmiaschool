const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const teachers = await collections.teachers()
      .find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .toArray();
    res.json({ teachers });
  } catch (err) {
    console.error('Get teachers error:', err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { search, subject, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (search) {
      filter.$text = { $search: search };
    }
    if (subject) filter.subject = subject;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [teachers, total] = await Promise.all([
      collections.teachers().find(filter)
        .sort({ displayOrder: 1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      collections.teachers().countDocuments(filter)
    ]);

    const subjects = await collections.teachers().distinct('subject');

    res.json({ 
      teachers, 
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      subjects
    });
  } catch (err) {
    console.error('Get admin teachers error:', err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }
    
    const teacher = await collections.teachers().findOne({ _id: new ObjectId(id) });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    res.json({ teacher });
  } catch (err) {
    console.error('Get teacher error:', err);
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

router.post('/', requireAdmin, upload.single('photo'), handleUploadError, async (req, res) => {
  try {
    const { 
      name, designation, subject, qualification, 
      experience, achievement, biography, displayOrder 
    } = req.body;

    if (!name || !designation || !subject) {
      return res.status(400).json({ error: 'Name, designation, and subject are required' });
    }

    const teacher = {
      name,
      designation,
      subject,
      qualification: qualification || '',
      experience: experience || '',
      achievement: achievement || '',
      biography: biography || '',
      photo: req.file ? `/uploads/${req.file.filename}` : '',
      displayOrder: parseInt(displayOrder) || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.teachers().insertOne(teacher);
    res.json({ success: true, teacher: { ...teacher, _id: result.insertedId } });
  } catch (err) {
    console.error('Create teacher error:', err);
    res.status(500).json({ error: 'Failed to create teacher' });
  }
});

router.put('/:id', requireAdmin, upload.single('photo'), handleUploadError, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, designation, subject, qualification, 
      experience, achievement, biography, displayOrder, isActive 
    } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }
    if (!name || !designation || !subject) {
      return res.status(400).json({ error: 'Name, designation, and subject are required' });
    }

    const updateData = {
      name,
      designation,
      subject,
      qualification: qualification || '',
      experience: experience || '',
      achievement: achievement || '',
      biography: biography || '',
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    await collections.teachers().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const teacher = await collections.teachers().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, teacher });
  } catch (err) {
    console.error('Update teacher error:', err);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    await collections.teachers().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete teacher error:', err);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

module.exports = router;