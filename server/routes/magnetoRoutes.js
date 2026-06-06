const express = require('express');
const router = express.Router();
const magnetoController = require('../controllers/magnetoController');

router.post('/start', magnetoController.startAssessment);
router.post('/answer', magnetoController.saveAnswer);
router.post('/gate', magnetoController.emailGate);
router.get('/report/:reportToken', magnetoController.getReport);

module.exports = router;
