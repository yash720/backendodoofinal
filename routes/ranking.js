const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const { authenticateToken, authorizeStudent } = require('../middleware/auth');

// All routes require student authentication
router.use(authenticateToken, authorizeStudent);

// Get campus leaderboard
router.get('/leaderboard', rankingController.getCampusLeaderboard);

// Get student's personal ranking details
router.get('/my-ranking', rankingController.getStudentRanking);

// Get top performers
router.get('/top-performers', rankingController.getTopPerformers);

// Get ranking statistics
router.get('/stats', rankingController.getRankingStats);

// Update student score (called internally after quiz completion)
router.post('/update-score', rankingController.updateStudentScore);

module.exports = router;

