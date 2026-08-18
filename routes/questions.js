const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken, authorizeTPO } = require('../middleware/auth');

// Question Set routes (TPO only)
router.post('/question-sets', authenticateToken, authorizeTPO, questionController.createQuestionSet);
router.get('/question-sets', authenticateToken, questionController.getAllQuestionSets);
router.get('/question-sets/:id', authenticateToken, questionController.getQuestionSetById);
router.put('/question-sets/:id', authenticateToken, authorizeTPO, questionController.updateQuestionSet);
router.delete('/question-sets/:id', authenticateToken, authorizeTPO, questionController.deleteQuestionSet);

// Question routes (TPO only)
router.post('/questions', authenticateToken, authorizeTPO, questionController.createQuestion);
router.get('/questions', authenticateToken, questionController.getAllQuestions);
router.put('/questions/:id', authenticateToken, authorizeTPO, questionController.updateQuestion);
router.delete('/questions/:id', authenticateToken, authorizeTPO, questionController.deleteQuestion);

module.exports = router;

