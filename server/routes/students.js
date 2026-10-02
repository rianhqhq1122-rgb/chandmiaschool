const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const { class: className, year, limit } = req.query;
    const filter = { isActive: true };
    
    if (className) filter.class = className;
    if (year) filter.academicYear = year;

    let query = collections.students().find(filter).sort({ displayOrder: 1, name: 1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const students = await query.toArray();
    res.json({ students });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { search, class: className, year, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (search) {
      filter.$text = { $search: search };
    }
    if (className) filter.class = className;
    if (year) filter.academicYear = year;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [students, total] = await Promise.all([
      collections.students().find(filter)
        .sort({ displayOrder: 1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      collections.students().countDocuments(filter)
    ]);

    const classes = await collections.students().distinct('class');
    const years = await collections.students().distinct('academicYear');

    res.json({ 
      students, 
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      classes,
      years
    });
  } catch (err) {
    console.error('Get admin students error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    const student = await collections.students().findOne({ _id: new ObjectId(id) });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ student });
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

router.post('/', requireAdmin, upload.single('photo'), handleUploadError, async (req, res) => {
  try {
    const { 
      name, class: className, section, academicYear, 
      role, achievement, exam, gpa, description, 
      displayOnHomepage, displayOrder 
    } = req.body;

    if (!name || !className || !academicYear) {
      return res.status(400).json({ error: 'Name, class, and academic year are required' });
    }

    const student = {
      name,
      class: className,
      section: section || '',
      academicYear,
      role: role || 'Student',
      achievement: achievement || '',
      exam: exam || '',
      gpa: gpa || '',
      description: description || '',
      photo: req.file ? `/uploads/${req.file.filename}` : '',
      displayOnHomepage: displayOnHomepage === 'true' || displayOnHomepage === true,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.students().insertOne(student);
    res.json({ success: true, student: { ...student, _id: result.insertedId } });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.put('/:id', requireAdmin, upload.single('photo'), handleUploadError, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, class: className, section, academicYear, 
      role, achievement, exam, gpa, description, 
      displayOnHomepage, displayOrder, isActive 
    } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    if (!name || !className || !academicYear) {
      return res.status(400).json({ error: 'Name, class, and academic year are required' });
    }

    const updateData = {
      name,
      class: className,
      section: section || '',
      academicYear,
      role: role || 'Student',
      achievement: achievement || '',
      exam: exam || '',
      gpa: gpa || '',
      description: description || '',
      displayOnHomepage: displayOnHomepage === 'true' || displayOnHomepage === true,
      displayOrder: parseInt(displayOrder) || 0,
      isActive: isActive === 'true' || isActive === true,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    await collections.students().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const student = await collections.students().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, student });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    await collections.students().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

router.get('/homepage/top', async (req, res) => {
  try {
    const students = await collections.students()
      .find({ displayOnHomepage: true, isActive: true })
      .sort({ displayOrder: 1 })
      .limit(6)
      .toArray();
    res.json({ students });
  } catch (err) {
    console.error('Get top students error:', err);
    res.status(500).json({ error: 'Failed to fetch top students' });
  }
});

module.exports = router;