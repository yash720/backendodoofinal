const express = require('express');
const router = express.Router();
const tpoJobController = require('../controllers/tpoJobController');
const { authenticateToken, authorizeTPO } = require('../middleware/auth');

router.use(authenticateToken, authorizeTPO);

router.get('/pending', tpoJobController.getPendingJobs);

router.get('/approved', tpoJobController.getApprovedJobs);

router.get('/rejected', tpoJobController.getRejectedJobs);

router.get('/stats', tpoJobController.getJobApprovalStats);

router.get('/job/:jobId', tpoJobController.getJobDetails);

router.post('/approve/:jobId', tpoJobController.approveJob);

router.post('/reject/:jobId', tpoJobController.rejectJob);

module.exports = router;

