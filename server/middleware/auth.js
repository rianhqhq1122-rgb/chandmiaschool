const { collections } = require('../models');

async function requireAdmin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.redirect('/admin/login.html');
  }

  const admin = await collections.adminUsers().findOne({ _id: req.session.adminId });
  if (!admin) {
    req.session.destroy();
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.redirect('/admin/login.html');
  }

  req.admin = admin;
  next();
}

function optionalAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    req.admin = true;
  }
  next();
}

module.exports = { requireAdmin, optionalAdmin };