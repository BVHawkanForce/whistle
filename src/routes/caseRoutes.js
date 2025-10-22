const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');

// Display the login page for accessing a case
router.get('/case/login', (req, res) => {
    res.render('case-login', { t: req.t });
});

// Fetch and display a case
router.get('/case', caseController.getCase);

// Post a new message to a case
router.post('/case/:id/messages', caseController.postMessage);

module.exports = router;
