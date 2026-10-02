const express = require('express');
const { collections } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalGallery,
      totalAchievements,
      newInquiries,
      recentInquiries,
      recentStudents
    ] = await Promise.all([
      collections.students().countDocuments({ isActive: true }),
      collections.teachers().countDocuments({ isActive: true }),
      collections.gallery().countDocuments({ isActive: true }),
      collections.achievements().countDocuments({ isActive: true }),
      collections.admissionInquiries().countDocuments({ status: 'New' }),
      collections.admissionInquiries()
        .find({ status: 'New' })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
      collections.students()
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
    ]);

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalGallery,
        totalAchievements,
        newInquiries
      },
      recentInquiries,
      recentStudents
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;