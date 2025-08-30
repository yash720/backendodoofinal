const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../config/auth');
const CompanyController = require('../controllers/CompanyController');

// All routes protected
router.use(verifyToken, authorizeRoles('company'));

// Job Management
router.post('/create-job', CompanyController.createJob);
router.get('/jobs', CompanyController.getJobs);

// Application Management
router.get('/applications/:jobId', CompanyController.getApplications);

// Offer Management
router.post('/create-offer', CompanyController.createOffer);
router.put('/update-offer/:offerId', CompanyController.updateOffer);

module.exports = router;