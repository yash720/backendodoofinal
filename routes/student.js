// routes/student.js
const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../config/auth');
const StudentController = require('../controllers/StudentController');

// All routes protected
router.use(verifyToken, authorizeRoles('student'));

// Dashboard & Profile
router.get('/dashboard', StudentController.getDashboard);
router.post('/update-profile', StudentController.updateProfile);

// Home Page - View All Available Jobs (Simplified)
router.get('/home', StudentController.getAllJobs);

// View Complete Job Details
router.get('/job/:jobId', StudentController.getJobDetails);

// Resume
router.post('/upload-resume', StudentController.uploadResume);
router.get('/view-resumes', StudentController.viewResumes);

// Apply for job
router.post('/apply/:jobId', StudentController.applyForJob);

// Get application status (Legacy)
router.get('/applications', StudentController.getApplications);

// Get My Applications with Detailed Status
router.get('/my-applications', StudentController.getMyApplications);

// Placement History
router.get('/placement-history', StudentController.getPlacementHistory);

module.exports = router;
