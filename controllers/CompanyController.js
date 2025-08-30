const Company = require('../models/Company');
const Job = require('../models/Jobs');
const Application = require('../models/Application');
const Offer = require('../models/Offer');

const CompanyController = {
  // Create Job
  createJob: async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        package,
        eligibilityCriteria,
        deadline,
        compensation,
        timeline
      } = req.body;

      const companyId = req.userId; // Fixed: using req.userId

      const job = new Job({
        title,
        description,
        location,
        package,
        eligibilityCriteria,
        company: companyId,
        deadline,
        compensation,
        timeline,
        approvalStatus: 'pending', // Set initial status as pending
        status: 'Closed' // Keep job closed until approved
      });

      await job.save();

      // Add job to company
      await Company.findByIdAndUpdate(companyId, {
        $push: { jobs: job._id }
      });

      res.json({
        success: true,
        message: 'Job created successfully',
        job
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get Jobs
  getJobs: async (req, res) => {
    try {
      const companyId = req.userId; // Fixed: using req.userId
      const jobs = await Job.find({ company: companyId })
        .populate('applications')
        .sort({ createdAt: -1 });

      // Check and update job status based on deadline
      const currentDate = new Date();
      let jobsUpdated = false;

      for (let job of jobs) {
        // Check if job should be closed based on online test date, not application deadline
        if (job.status === 'Open' && job.timeline && job.timeline.onlineTest) {
          const onlineTestDate = new Date(job.timeline.onlineTest);
          if (onlineTestDate < currentDate) {
            // Auto-close jobs after online test date
            await Job.findByIdAndUpdate(job._id, { status: 'Closed' });
            job.status = 'Closed';
            jobsUpdated = true;
          }
        }
      }

      if (jobsUpdated) {
        console.log('Some jobs were automatically closed due to online test date passed');
      }

      // Format jobs with application count and status
      const formattedJobs = jobs.map(job => ({
        id: job._id,
        title: job.title,
        description: job.description,
        location: job.location,
        package: job.package,
        eligibilityCriteria: job.eligibilityCriteria,
        branch: job.branch,
        deadline: job.deadline,
        status: job.status,
        approvalStatus: job.approvalStatus,
        statusInfo: getJobStatusInfo(job.status, job.deadline, job.timeline),
        compensation: job.compensation,
        timeline: job.timeline,
        applicationCount: job.applications ? job.applications.length : 0,
        isExpired: new Date(job.deadline) < currentDate,
        daysUntilDeadline: getDaysUntilDeadline(job.deadline, job.timeline),
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        approvedAt: job.approvedAt,
        rejectionReason: job.rejectionReason
      }));

      res.json({
        success: true,
        totalJobs: formattedJobs.length,
        openJobs: formattedJobs.filter(job => job.status === 'Open').length,
        closedJobs: formattedJobs.filter(job => job.status === 'Closed').length,
        expiredJobs: formattedJobs.filter(job => job.isExpired).length,
        jobs: formattedJobs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get Applications
  getApplications: async (req, res) => {
    try {
      const companyId = req.userId; // Fixed: using req.userId
      const applications = await Application.find()
        .populate({
          path: 'job',
          match: { company: companyId }
        })
        .populate('student')
        .sort({ appliedAt: -1 });

      // Filter applications for this company
      const companyApplications = applications.filter(app => app.job);

      res.json({
        success: true,
        applications: companyApplications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Create Offer
  createOffer: async (req, res) => {
    try {
      const {
        studentId,
        jobId,
        offerLetterURL,
        package
      } = req.body;

      const companyId = req.userId; // Fixed: using req.userId

      const offer = new Offer({
        student: studentId,
        job: jobId,
        company: companyId,
        offerLetterURL,
        package
      });

      await offer.save();

      res.json({
        success: true,
        message: 'Offer created successfully',
        offer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update Offer
  updateOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      const updateData = req.body;

      const offer = await Offer.findByIdAndUpdate(
        offerId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!offer) {
        return res.status(404).json({
          success: false,
          message: 'Offer not found'
        });
      }

      res.json({
        success: true,
        message: 'Offer updated successfully',
        offer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

// Helper function to get job status information
function getJobStatusInfo(status, deadline, timeline) {
  const currentDate = new Date();
  const deadlineDate = new Date(deadline);
  const onlineTestDate = timeline?.onlineTest ? new Date(timeline.onlineTest) : null;
  
  if (status === 'Closed') {
    return {
      label: 'Closed',
      color: 'red',
      description: 'This job posting is no longer accepting applications',
      reason: onlineTestDate && onlineTestDate < currentDate ? 'Online test date passed' : 'Manually closed'
    };
  }
  
  if (status === 'Open') {
    // Check if online test date has passed
    if (onlineTestDate && onlineTestDate < currentDate) {
      return {
        label: 'Expired',
        color: 'orange',
        description: 'Online test date has passed, job will be closed automatically',
        reason: 'Online test date passed'
      };
    }
    
    // Check days until online test (not deadline)
    if (onlineTestDate) {
      const daysLeft = Math.ceil((onlineTestDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 3) {
        return {
          label: 'Urgent',
          color: 'red',
          description: `Online test approaching! Only ${daysLeft} day(s) left`,
          reason: 'Online test soon'
        };
      } else if (daysLeft <= 7) {
        return {
          label: 'Active',
          color: 'orange',
          description: `${daysLeft} day(s) until online test`,
          reason: 'Online test approaching'
        };
      } else {
        return {
          label: 'Active',
          color: 'green',
          description: `${daysLeft} day(s) until online test`,
          reason: 'Open for applications'
        };
      }
    } else {
      // If no online test date, use deadline
      const daysLeft = Math.ceil((deadlineDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 3) {
        return {
          label: 'Urgent',
          color: 'red',
          description: `Deadline approaching! Only ${daysLeft} day(s) left`,
          reason: 'Deadline soon'
        };
      } else if (daysLeft <= 7) {
        return {
          label: 'Active',
          color: 'orange',
          description: `${daysLeft} day(s) remaining to apply`,
          reason: 'Deadline approaching'
        };
      } else {
        return {
          label: 'Active',
          color: 'green',
          description: `${daysLeft} day(s) remaining to apply`,
          reason: 'Open for applications'
        };
      }
    }
  }
  
  return {
    label: status,
    color: 'gray',
    icon: '❓',
    description: 'Status information not available',
    reason: 'Unknown'
  };
}

// Helper function to calculate days until deadline
function getDaysUntilDeadline(deadline, timeline) {
  const currentDate = new Date();
  const deadlineDate = new Date(deadline);
  const onlineTestDate = timeline?.onlineTest ? new Date(timeline.onlineTest) : null;
  
  // Use online test date if available, otherwise use deadline
  const targetDate = onlineTestDate || deadlineDate;
  const diffTime = targetDate - currentDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      status: 'expired',
      message: onlineTestDate ? `Online test passed ${Math.abs(diffDays)} day(s) ago` : `Expired ${Math.abs(diffDays)} day(s) ago`,
      type: onlineTestDate ? 'onlineTest' : 'deadline'
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      status: 'today',
      message: onlineTestDate ? 'Online test is today!' : 'Deadline is today!',
      type: onlineTestDate ? 'onlineTest' : 'deadline'
    };
  } else {
    return {
      days: diffDays,
      status: 'remaining',
      message: onlineTestDate ? `${diffDays} day(s) until online test` : `${diffDays} day(s) remaining`,
      type: onlineTestDate ? 'onlineTest' : 'deadline'
    };
  }
}

module.exports = CompanyController;
