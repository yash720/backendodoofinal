// routes/tpo.js
const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../config/auth');
const TPOController = require('../controllers/TPOController');

router.use(verifyToken, authorizeRoles('tpo'));

// Manage job postings
router.post('/jobs', TPOController.createJob);
router.put('/jobs/:jobId', TPOController.updateJob);
router.delete('/jobs/:jobId', TPOController.deleteJob);

// Enforce rules, generate reports, view applications
router.get('/applications', TPOController.viewApplications);
router.get('/reports', TPOController.generateReports);

module.exports = router;
