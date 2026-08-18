const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../config/auth');
const CompanyController = require('../controllers/CompanyController');

router.use(verifyToken, authorizeRoles('company'));

router.post('/create-job', CompanyController.createJob);
router.get('/jobs', CompanyController.getJobs);

router.get('/applications/:jobId', CompanyController.getApplications);

router.post('/create-offer', CompanyController.createOffer);
router.put('/update-offer/:offerId', CompanyController.updateOffer);

module.exports = router;