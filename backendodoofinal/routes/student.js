const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../config/auth');
const StudentController = require('../controllers/StudentController');

router.use(verifyToken, authorizeRoles('student'));

router.get('/dashboard', StudentController.getDashboard);
router.post('/update-profile', StudentController.updateProfile);

router.get('/home', StudentController.getAllJobs);

router.get('/job/:jobId', StudentController.getJobDetails);

router.post('/upload-resume', StudentController.uploadResume);
router.get('/view-resumes', StudentController.viewResumes);

router.post('/apply/:jobId', StudentController.applyForJob);

router.get('/applications', StudentController.getApplications);

router.get('/my-applications', StudentController.getMyApplications);

router.get('/placement-history', StudentController.getPlacementHistory);

module.exports = router;
