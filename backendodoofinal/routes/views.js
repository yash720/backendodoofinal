const router = require('express').Router();

router.get('/', (req, res) => res.render('index', { page: 'home' }));

router.get('/login', (req, res) => res.render('login', { page: 'login' }));
router.get('/register', (req, res) => res.render('register', { page: 'register' }));

router.get('/student/dashboard', (req, res) => res.render('student/dashboard', { page: 'student-dashboard' }));
router.get('/student/jobs', (req, res) => res.render('student/jobs', { page: 'student-jobs' }));
router.get('/student/job/:jobId', (req, res) => res.render('student/job-details', { page: 'student-job-details', jobId: req.params.jobId }));
router.get('/student/applications', (req, res) => res.render('student/applications', { page: 'student-applications' }));
router.get('/student/placement-history', (req, res) => res.render('student/placement-history', { page: 'student-placement-history' }));
router.get('/student/profile', (req, res) => res.render('student/profile', { page: 'student-profile' }));
router.get('/student/tests', (req, res) => res.render('student/tests', { page: 'student-tests' }));
router.get('/student/take-test/:questionSetId', (req, res) => res.render('student/take-test', { page: 'student-take-test', questionSetId: req.params.questionSetId }));
router.get('/student/test-results/:testSessionId?', (req, res) => res.render('student/test-results', { page: 'student-test-results', testSessionId: req.params.testSessionId || null }));
router.get('/student/leaderboard', (req, res) => res.render('student/leaderboard', { page: 'student-leaderboard' }));
router.get('/student/notifications', (req, res) => res.render('student/notifications', { page: 'student-notifications' }));

router.get('/company/dashboard', (req, res) => res.render('company/dashboard', { page: 'company-dashboard' }));
router.get('/company/create-job', (req, res) => res.render('company/create-job', { page: 'company-create-job' }));
router.get('/company/jobs', (req, res) => res.render('company/jobs', { page: 'company-jobs' }));
router.get('/company/applications/:jobId', (req, res) => res.render('company/applications', { page: 'company-applications', jobId: req.params.jobId }));

router.get('/tpo/dashboard', (req, res) => res.render('tpo/dashboard', { page: 'tpo-dashboard' }));
router.get('/tpo/job-approval', (req, res) => res.render('tpo/job-approval', { page: 'tpo-job-approval' }));
router.get('/tpo/jobs', (req, res) => res.render('tpo/jobs', { page: 'tpo-jobs' }));
router.get('/tpo/applications', (req, res) => res.render('tpo/applications', { page: 'tpo-applications' }));
router.get('/tpo/reports', (req, res) => res.render('tpo/reports', { page: 'tpo-reports' }));
router.get('/tpo/questions', (req, res) => res.render('tpo/questions', { page: 'tpo-questions' }));

module.exports = router;
