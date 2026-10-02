const express = require('express');
const { collections, ObjectId } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

const DEFAULT_SETTINGS = {
  schoolName: 'Chand Mia High School',
  schoolAddress: 'Nesarabad, Pirojpur, Bangladesh',
  schoolPhone: '+880 1XXXXXXXXX',
  schoolAltPhone: '',
  schoolEmail: 'info@chandmiaschool.edu.bd',
  admissionEmail: 'admission@chandmiaschool.edu.bd',
  principalName: '[Add Principal Name]',
  principalPhone: '[Add Principal Phone]',
  schoolDescription: 'Chand Mia High School is a secondary school in Nesarabad, Pirojpur. The school provides education for students in different grades and offers academic subjects along with sports and other activities.',
  aboutSchool: 'Chand Mia High School has been serving students in Nesarabad for many years. The school focuses on regular classes, examination preparation, sports, and other activities that help students develop outside the classroom.',
  mission: 'To provide quality education that prepares students for higher studies and responsible citizenship.',
  vision: 'To be a leading educational institution in the region known for academic excellence and character development.',
  schoolMotto: 'Learning. Growing. Moving Forward.',
  facebookUrl: '',
  youtubeUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  logo: '',
  favicon: ''
};

async function getSettings() {
  const settings = await collections.schoolSettings().findOne({ key: 'main' });
  if (!settings) {
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, ...settings };
}

router.get('/public', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ settings });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ settings });
  } catch (err) {
    console.error('Get admin settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'schoolName', 'schoolAddress', 'schoolPhone', 'schoolAltPhone',
      'schoolEmail', 'admissionEmail', 'principalName', 'principalPhone',
      'schoolDescription', 'aboutSchool', 'mission', 'vision', 'schoolMotto',
      'facebookUrl', 'youtubeUrl', 'instagramUrl', 'linkedinUrl'
    ];

    const filtered = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filtered[field] = updates[field];
      }
    }

    await collections.schoolSettings().updateOne(
      { key: 'main' },
      { $set: { ...filtered, updatedAt: new Date() } },
      { upsert: true }
    );

    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.post('/logo', requireAdmin, upload.single('logo'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const logoUrl = `/uploads/${req.file.filename}`;
    
    await collections.schoolSettings().updateOne(
      { key: 'main' },
      { $set: { logo: logoUrl, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true, logo: logoUrl });
  } catch (err) {
    console.error('Upload logo error:', err);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

router.post('/favicon', requireAdmin, upload.single('favicon'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const faviconUrl = `/uploads/${req.file.filename}`;
    
    await collections.schoolSettings().updateOne(
      { key: 'main' },
      { $set: { favicon: faviconUrl, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true, favicon: faviconUrl });
  } catch (err) {
    console.error('Upload favicon error:', err);
    res.status(500).json({ error: 'Failed to upload favicon' });
  }
});

module.exports = router;