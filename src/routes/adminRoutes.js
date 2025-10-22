const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/admin/login');
}

// Display the admin login page
router.get('/admin/login', adminController.getLogin);

// Handle admin login
router.post('/admin/login', adminController.postLogin);

// Handle admin logout
router.get('/admin/logout', adminController.getLogout);

// Display the admin dashboard (protected)
router.get('/admin/dashboard', isAuthenticated, adminController.getDashboard);

// Export a report as PDF (protected)
router.get('/admin/export/:id', isAuthenticated, adminController.exportPdf);

// Close a case (protected)
router.get('/admin/case/close/:id', isAuthenticated, adminController.closeCase);

// Compliance report (protected)
router.get('/admin/reports/compliance', isAuthenticated, adminController.getComplianceReport);

// Last year's report (protected)
router.get('/admin/reports/last-year', isAuthenticated, adminController.getLastYearReport);

module.exports = router;
