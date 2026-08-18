const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { authenticateToken, authorizeStudent, authorizeTPO } = require('../middleware/auth');

router.post('/start/:questionSetId', authenticateToken, authorizeStudent, testController.startTest);
router.post('/:testSessionId/answer/:questionId', authenticateToken, authorizeStudent, testController.submitAnswer);
router.post('/:testSessionId/submit', authenticateToken, authorizeStudent, testController.submitTest);

router.get('/results/:testSessionId', authenticateToken, authorizeStudent, testController.getTestResults);
router.get('/results', authenticateToken, authorizeStudent, testController.getAllTestResults);

router.get('/analytics/:questionSetId', authenticateToken, authorizeTPO, testController.getTestAnalytics);

module.exports = router;

