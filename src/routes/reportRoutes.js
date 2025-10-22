const express = require('express');
const router = express.Router();

// Render the report form
router.get('/report', (req, res) => {
    res.render('report', { t: req.t });
});

// Handle form submission
const reportController = require('../controllers/reportController');
router.post('/report', reportController.submitReport);

router.get('/report/success', (req, res) => {
    const { code } = req.query;
    res.render('report-success', { t: req.t, code });
});

module.exports = router;
