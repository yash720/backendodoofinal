const express = require('express');
const router = express.Router();
const tpoJobController = require('../controllers/tpoJobController');
const { authenticateToken, authorizeTPO } = require('../middleware/auth');

// All routes require TPO authentication
router.use(authenticateToken, authorizeTPO);

// Get pending job requests
router.get('/pending', tpoJobController.getPendingJobs);

// Get approved jobs
router.get('/approved', tpoJobController.getApprovedJobs);

// Get rejected jobs
router.get('/rejected', tpoJobController.getRejectedJobs);

// Get job approval statistics
router.get('/stats', tpoJobController.getJobApprovalStats);

// Get detailed job information
router.get('/job/:jobId', tpoJobController.getJobDetails);

// Approve a job
router.post('/approve/:jobId', tpoJobController.approveJob);

// Reject a job
router.post('/reject/:jobId', tpoJobController.rejectJob);

module.exports = router;

