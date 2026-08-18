const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Job = require('../models/Jobs');
const Student = require('../models/Student');
const QuestionSet = require('../models/QuestionSet');

// Get placement timeline for a student
exports.getPlacementTimeline = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all applications with timeline data
    const applications = await Application.find({ student: studentId })
      .populate('job', 'title company location package deadline')
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo industry' }
      })
      .sort({ appliedAt: -1 });

    // Format timeline data
    const timelineData = applications.map(app => {
      const timeline = app.timeline;
      const stages = [
        {
          stage: 'Applied',
          date: timeline.applied.date,
          completed: timeline.applied.completed,
          status: 'completed',
          icon: '📝',
          description: 'Application submitted successfully'
        },
        {
          stage: 'Test',
          date: timeline.test.date,
          completed: timeline.test.completed,
          status: timeline.test.completed ? 'completed' : 
                 (timeline.test.date && new Date(timeline.test.date) < new Date()) ? 'overdue' : 'pending',
          icon: '📊',
          description: timeline.test.completed ? 
            `Test completed with score: ${timeline.test.score}` : 
            timeline.test.date ? `Test scheduled for ${new Date(timeline.test.date).toLocaleDateString()}` : 'Test not scheduled yet',
          details: timeline.test
        },
        {
          stage: 'Shortlisted',
          date: timeline.shortlisted.date,
          completed: timeline.shortlisted.completed,
          status: timeline.shortlisted.completed ? 'completed' : 'pending',
          icon: '✅',
          description: timeline.shortlisted.completed ? 
            'Successfully shortlisted for next round' : 'Awaiting shortlisting decision',
          message: timeline.shortlisted.message
        },
        {
          stage: 'Interview',
          date: timeline.interview.date,
          completed: timeline.interview.completed,
          status: timeline.interview.completed ? 'completed' : 
                 (timeline.interview.date && new Date(timeline.interview.date) < new Date()) ? 'overdue' : 'pending',
          icon: '🎯',
          description: timeline.interview.completed ? 
            'Interview completed successfully' : 
            timeline.interview.date ? `Interview scheduled for ${new Date(timeline.interview.date).toLocaleDateString()}` : 'Interview not scheduled yet',
          details: timeline.interview
        },
        {
          stage: 'Offer',
          date: timeline.offer.date,
          completed: timeline.offer.completed,
          status: timeline.offer.completed ? 'completed' : 'pending',
          icon: '🎉',
          description: timeline.offer.completed ? 
            `Offer received with package: ₹${timeline.offer.package?.total?.toLocaleString()} LPA` : 'Awaiting offer',
          details: timeline.offer
        },
        {
          stage: 'Placed',
          date: timeline.placed.date,
          completed: timeline.placed.completed,
          status: timeline.placed.completed ? 'completed' : 'pending',
          icon: '🏆',
          description: timeline.placed.completed ? 
            `Successfully placed! Joining on ${new Date(timeline.placed.joiningDate).toLocaleDateString()}` : 'Final placement stage',
          details: timeline.placed
        }
      ];

      return {
        applicationId: app._id,
        job: {
          id: app.job._id,
          title: app.job.title,
          company: app.job.company,
          location: app.job.location,
          package: app.job.package
        },
        currentStatus: app.status,
        currentStage: app.currentStage,
        stageProgress: app.stageProgress,
        appliedAt: app.appliedAt,
        lastUpdated: app.lastUpdated,
        nextDeadline: app.nextDeadline,
        timeline: stages,
        overallProgress: calculateOverallProgress(stages)
      };
    });

    // Calculate overall placement statistics
    const totalApplications = applications.length;
    const activeApplications = applications.filter(app => 
      !['Rejected', 'Placed'].includes(app.status)
    ).length;
    const placedApplications = applications.filter(app => 
      app.status === 'Placed'
    ).length;

    res.status(200).json({
      success: true,
      message: 'Placement timeline retrieved successfully',
      data: {
        timelineData,
        statistics: {
          totalApplications,
          activeApplications,
          placedApplications,
          placementRate: totalApplications > 0 ? ((placedApplications / totalApplications) * 100).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching placement timeline',
      error: error.message
    });
  }
};

// Get detailed timeline for a specific application
exports.getApplicationTimeline = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const studentId = req.user.id;

    const application = await Application.findOne({
      _id: applicationId,
      student: studentId
    })
    .populate('job', 'title company location package deadline')
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'name logo industry website' }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get notifications related to this application
    const notifications = await Notification.find({
      student: studentId,
      'relatedData.applicationId': applicationId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Application timeline retrieved successfully',
      data: {
        application: {
          id: application._id,
          status: application.status,
          currentStage: application.currentStage,
          stageProgress: application.stageProgress,
          appliedAt: application.appliedAt,
          lastUpdated: application.lastUpdated,
          nextDeadline: application.nextDeadline,
          timeline: application.timeline,
          notes: application.notes,
          documents: application.documents
        },
        job: application.job,
        notifications
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application timeline',
      error: error.message
    });
  }
};

// Update application stage (for companies/TPOs)
exports.updateApplicationStage = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { stage, details, message } = req.body;
    const userId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate('student', 'name email')
      .populate('job', 'title company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update timeline based on stage
    const timeline = application.timeline;
    const currentDate = new Date();

    switch (stage) {
      case 'Test':
        timeline.test = {
          ...timeline.test,
          date: details.date || currentDate,
          completed: false,
          location: details.location,
          instructions: details.instructions
        };
        break;
      case 'Shortlisted':
        timeline.shortlisted = {
          ...timeline.shortlisted,
          date: currentDate,
          completed: true,
          message: message || 'Congratulations! You have been shortlisted.'
        };
        break;
      case 'Interview':
        timeline.interview = {
          ...timeline.interview,
          date: details.date,
          completed: false,
          location: details.location,
          type: details.type,
          interviewer: details.interviewer,
          duration: details.duration,
          instructions: details.instructions
        };
        break;
      case 'Offer':
        timeline.offer = {
          ...timeline.offer,
          date: currentDate,
          completed: true,
          package: details.package,
          joiningDate: details.joiningDate,
          offerLetterUrl: details.offerLetterUrl,
          acceptanceDeadline: details.acceptanceDeadline
        };
        break;
      case 'Placed':
        timeline.placed = {
          ...timeline.placed,
          date: currentDate,
          completed: true,
          joiningDate: details.joiningDate,
          companyLocation: details.companyLocation
        };
        break;
    }

    // Update application status and progress
    application.status = stage;
    application.currentStage = stage;
    application.stageProgress = calculateStageProgress(stage);
    application.lastUpdated = currentDate;

    // Set next deadline
    if (details.nextDeadline) {
      application.nextDeadline = details.nextDeadline;
    }

    await application.save();

    // Create notification for student
    await createApplicationNotification(application, stage, details, message);

    res.status(200).json({
      success: true,
      message: 'Application stage updated successfully',
      data: {
        applicationId: application._id,
        newStage: stage,
        stageProgress: application.stageProgress,
        nextDeadline: application.nextDeadline
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application stage',
      error: error.message
    });
  }
};

// Get daily updates and notifications
exports.getDailyUpdates = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10, type } = req.query;

    // Build query
    const query = { student: studentId, isDeleted: false };
    if (type) {
      query.type = type;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .populate('relatedData.applicationId')
      .populate('relatedData.jobId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      student: studentId,
      isRead: false,
      isDeleted: false
    });

    // Get upcoming deadlines
    const upcomingDeadlines = await getUpcomingDeadlines(studentId);

    // Get recent opportunities
    const recentOpportunities = await getRecentOpportunities(studentId);

    res.status(200).json({
      success: true,
      message: 'Daily updates retrieved successfully',
      data: {
        notifications,
        unreadCount,
        upcomingDeadlines,
        recentOpportunities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Notification.countDocuments(query)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily updates',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const studentId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, student: studentId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const studentId = req.user.id;

    await Notification.updateMany(
      { student: studentId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const studentId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, student: studentId },
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Helper function to calculate overall progress
function calculateOverallProgress(stages) {
  const completedStages = stages.filter(stage => stage.completed).length;
  return Math.round((completedStages / stages.length) * 100);
}

// Helper function to calculate stage progress
function calculateStageProgress(stage) {
  const stageOrder = ['Applied', 'Test', 'Shortlisted', 'Interview', 'Offer', 'Placed'];
  const stageIndex = stageOrder.indexOf(stage);
  return Math.round(((stageIndex + 1) / stageOrder.length) * 100);
}

// Helper function to create application notification
async function createApplicationNotification(application, stage, details, message) {
  const notificationData = {
    student: application.student._id,
    type: 'application_update',
    priority: 'high',
    actionRequired: true,
    relatedData: {
      applicationId: application._id
    }
  };

  switch (stage) {
    case 'Test':
      notificationData.title = 'Test Scheduled';
      notificationData.message = `Test scheduled for ${application.job.title} at ${details.location}`;
      notificationData.relatedData.deadlineDate = details.date;
      notificationData.actionUrl = `/applications/${application._id}`;
      break;
    case 'Shortlisted':
      notificationData.title = 'Congratulations! Shortlisted';
      notificationData.message = `You have been shortlisted for ${application.job.title}`;
      notificationData.priority = 'urgent';
      break;
    case 'Interview':
      notificationData.title = 'Interview Scheduled';
      notificationData.message = `Interview scheduled for ${application.job.title} on ${new Date(details.date).toLocaleDateString()}`;
      notificationData.relatedData.interviewDate = details.date;
      notificationData.relatedData.interviewLocation = details.location;
      break;
    case 'Offer':
      notificationData.title = '🎉 Offer Received!';
      notificationData.message = `Congratulations! You have received an offer for ${application.job.title} with package ₹${details.package.total} LPA`;
      notificationData.priority = 'urgent';
      notificationData.relatedData.offerDetails = details;
      break;
    case 'Placed':
      notificationData.title = '🏆 Placement Achieved!';
      notificationData.message = `Congratulations! You have been successfully placed at ${application.job.company.name}`;
      notificationData.priority = 'urgent';
      break;
  }

  await Notification.create(notificationData);
}

// Helper function to get upcoming deadlines
async function getUpcomingDeadlines(studentId) {
  const applications = await Application.find({ student: studentId })
    .populate('job', 'title company')
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'name' }
    });

  const deadlines = [];

  applications.forEach(app => {
    if (app.nextDeadline && new Date(app.nextDeadline) > new Date()) {
      deadlines.push({
        type: 'application_deadline',
        title: `Deadline for ${app.job.title}`,
        deadline: app.nextDeadline,
        applicationId: app._id,
        jobTitle: app.job.title,
        companyName: app.job.company.name
      });
    }
  });

  // Add job application deadlines
  const jobs = await Job.find({
    status: 'Open',
    approvalStatus: 'approved',
    deadline: { $gt: new Date() }
  }).populate('company', 'name');

  jobs.forEach(job => {
    deadlines.push({
      type: 'job_deadline',
      title: `Application deadline for ${job.title}`,
      deadline: job.deadline,
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.company.name
    });
  });

  return deadlines.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
}

// Helper function to get recent opportunities
async function getRecentOpportunities(studentId) {
  const recentJobs = await Job.find({
    status: 'Open',
    approvalStatus: 'approved',
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
  })
  .populate('company', 'name industry')
  .sort({ createdAt: -1 })
  .limit(5);

  return recentJobs.map(job => ({
    id: job._id,
    title: job.title,
    company: job.company.name,
    industry: job.company.industry,
    location: job.location,
    package: job.package,
    createdAt: job.createdAt
  }));
}
