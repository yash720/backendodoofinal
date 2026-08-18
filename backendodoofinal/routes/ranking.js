const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const { authenticateToken, authorizeStudent } = require('../middleware/auth');

router.use(authenticateToken, authorizeStudent);

router.get('/leaderboard', rankingController.getCampusLeaderboard);

router.get('/my-ranking', rankingController.getStudentRanking);

router.get('/top-performers', rankingController.getTopPerformers);

router.get('/stats', rankingController.getRankingStats);

router.post('/update-score', rankingController.updateStudentScore);

module.exports = router;

