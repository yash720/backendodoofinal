const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { authenticateToken, authorizeStudent, authorizeCompany, authorizeTPO } = require('../middleware/auth');

// Student routes
router.get('/placement-timeline', authenticateToken, authorizeStudent, timelineController.getPlacementTimeline);
router.get('/application/:applicationId', authenticateToken, authorizeStudent, timelineController.getApplicationTimeline);
router.get('/daily-updates', authenticateToken, authorizeStudent, timelineController.getDailyUpdates);
router.put('/notifications/:notificationId/read', authenticateToken, authorizeStudent, timelineController.markNotificationRead);
router.put('/notifications/read-all', authenticateToken, authorizeStudent, timelineController.markAllNotificationsRead);
router.delete('/notifications/:notificationId', authenticateToken, authorizeStudent, timelineController.deleteNotification);

// Company/TPO routes for updating application stages
router.put('/applications/:applicationId/stage', authenticateToken, authorizeRoles('company', 'tpo'), timelineController.updateApplicationStage);

// Helper middleware for multiple roles
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
  };
}

module.exports = router;

