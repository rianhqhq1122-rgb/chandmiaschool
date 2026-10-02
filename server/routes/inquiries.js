const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const STATUSES = ['New', 'Contacted', 'Resolved', 'Archived'];

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, grade, message } = req.body;

    if (!name || !email || !phone || !grade) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const inquiry = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      grade,
      message: message?.trim() || '',
      status: 'New',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.admissionInquiries().insertOne(inquiry);
    res.json({ success: true, inquiry: { ...inquiry, _id: result.insertedId } });
  } catch (err) {
    console.error('Create inquiry error:', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { search, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && STATUSES.includes(status)) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [inquiries, total] = await Promise.all([
      collections.admissionInquiries().find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      collections.admissionInquiries().countDocuments(filter)
    ]);

    const newCount = await collections.admissionInquiries().countDocuments({ status: 'New' });

    res.json({ 
      inquiries, 
      total,
      newCount,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      statuses: STATUSES
    });
  } catch (err) {
    console.error('Get inquiries error:', err);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid inquiry ID' });
    }
    
    const inquiry = await collections.admissionInquiries().findOne({ _id: new ObjectId(id) });
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    res.json({ inquiry });
  } catch (err) {
    console.error('Get inquiry error:', err);
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid inquiry ID' });
    }
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await collections.admissionInquiries().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    const inquiry = await collections.admissionInquiries().findOne({ _id: new ObjectId(id) });
    res.json({ success: true, inquiry });
  } catch (err) {
    console.error('Update inquiry error:', err);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid inquiry ID' });
    }

    await collections.admissionInquiries().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete inquiry error:', err);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

router.get('/stats/count', requireAdmin, async (req, res) => {
  try {
    const newCount = await collections.admissionInquiries().countDocuments({ status: 'New' });
    res.json({ newCount });
  } catch (err) {
    console.error('Get inquiry stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;