const router = require('express').Router();
const { registerController, loginController } = require('../controllers/authController');

// Public routes - no authentication required
router.post('/register', registerController);
router.post('/login', loginController);

module.exports = router;
