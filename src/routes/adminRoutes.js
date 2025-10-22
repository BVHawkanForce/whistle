const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Display the admin dashboard
router.get('/admin/dashboard', adminController.getDashboard);

// Export a report as PDF
router.get('/admin/export/:id', adminController.exportPdf);

module.exports = router;
