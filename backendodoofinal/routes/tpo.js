const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../config/auth');
const TPOController = require('../controllers/TPOController');

router.use(verifyToken, authorizeRoles('tpo'));

router.post('/jobs', TPOController.createJob);
router.put('/jobs/:jobId', TPOController.updateJob);
router.delete('/jobs/:jobId', TPOController.deleteJob);

router.get('/applications', TPOController.viewApplications);
router.get('/reports', TPOController.generateReports);

module.exports = router;
