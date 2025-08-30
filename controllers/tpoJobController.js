const Job = require('../models/Jobs');
const Company = require('../models/Company');
const TPO = require('../models/TPO');

// Get all pending job requests for TPO
exports.getPendingJobs = async (req, res) => {
  try {
    const pendingJobs = await Job.find({ approvalStatus: 'pending' })
      .populate('company', 'name email industry')
      .sort({ createdAt: -1 });

    const formattedJobs = pendingJobs.map(job => ({
      id: job._id,
      title: job.title,
      description: job.description,
      location: job.location,
      package: job.package,
      eligibilityCriteria: job.eligibilityCriteria,
      deadline: job.deadline,
      compensation: job.compensation,
      timeline: job.timeline,
      company: {
        id: job.company._id,
        name: job.company.name,
        email: job.company.email,
        industry: job.company.industry
      },
      createdAt: job.createdAt,
      daysSinceCreated: Math.floor((new Date() - job.createdAt) / (1000 * 60 * 60 * 24))
    }));

    res.status(200).json({
      success: true,
      message: 'Pending jobs retrieved successfully',
      data: {
        totalPending: formattedJobs.length,
        jobs: formattedJobs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending jobs',
      error: error.message
    });
  }
};

// Get all approved jobs for TPO
exports.getApprovedJobs = async (req, res) => {
  try {
    const approvedJobs = await Job.find({ approvalStatus: 'approved' })
      .populate('company', 'name email industry')
      .populate('approvedBy', 'name email')
      .sort({ approvedAt: -1 });

    const formattedJobs = approvedJobs.map(job => ({
      id: job._id,
      title: job.title,
      description: job.description,
      location: job.location,
      package: job.package,
      eligibilityCriteria: job.eligibilityCriteria,
      deadline: job.deadline,
      compensation: job.compensation,
      timeline: job.timeline,
      company: {
        id: job.company._id,
        name: job.company.name,
        email: job.company.email,
        industry: job.company.industry
      },
      approvedBy: {
        id: job.approvedBy._id,
        name: job.approvedBy.name,
        email: job.approvedBy.email
      },
      approvedAt: job.approvedAt,
      createdAt: job.createdAt
    }));

    res.status(200).json({
      success: true,
      message: 'Approved jobs retrieved successfully',
      data: {
        totalApproved: formattedJobs.length,
        jobs: formattedJobs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching approved jobs',
      error: error.message
    });
  }
};

// Get all rejected jobs for TPO
exports.getRejectedJobs = async (req, res) => {
  try {
    const rejectedJobs = await Job.find({ approvalStatus: 'rejected' })
      .populate('company', 'name email industry')
      .populate('approvedBy', 'name email')
      .sort({ updatedAt: -1 });

    const formattedJobs = rejectedJobs.map(job => ({
      id: job._id,
      title: job.title,
      description: job.description,
      location: job.location,
      package: job.package,
      eligibilityCriteria: job.eligibilityCriteria,
      deadline: job.deadline,
      compensation: job.compensation,
      timeline: job.timeline,
      company: {
        id: job.company._id,
        name: job.company.name,
        email: job.company.email,
        industry: job.company.industry
      },
      rejectedBy: {
        id: job.approvedBy._id,
        name: job.approvedBy.name,
        email: job.approvedBy.email
      },
      rejectionReason: job.rejectionReason,
      rejectedAt: job.updatedAt,
      createdAt: job.createdAt
    }));

    res.status(200).json({
      success: true,
      message: 'Rejected jobs retrieved successfully',
      data: {
        totalRejected: formattedJobs.length,
        jobs: formattedJobs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rejected jobs',
      error: error.message
    });
  }
};

// Approve a job
exports.approveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const tpoId = req.user.id;

    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Job is not in pending status'
      });
    }

    // Update job status to approved
    job.approvalStatus = 'approved';
    job.approvedBy = tpoId;
    job.approvedAt = new Date();
    job.status = 'Open'; // Make job visible on website

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job approved successfully',
      data: {
        jobId: job._id,
        title: job.title,
        approvedAt: job.approvedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving job',
      error: error.message
    });
  }
};

// Reject a job
exports.rejectJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { rejectionReason } = req.body;
    const tpoId = req.user.id;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Job is not in pending status'
      });
    }

    // Update job status to rejected
    job.approvalStatus = 'rejected';
    job.approvedBy = tpoId; // Using same field for rejected by
    job.rejectionReason = rejectionReason;
    job.status = 'Closed'; // Keep job closed

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job rejected successfully',
      data: {
        jobId: job._id,
        title: job.title,
        rejectionReason: job.rejectionReason,
        rejectedAt: job.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting job',
      error: error.message
    });
  }
};

// Get job approval statistics
exports.getJobApprovalStats = async (req, res) => {
  try {
    const pendingCount = await Job.countDocuments({ approvalStatus: 'pending' });
    const approvedCount = await Job.countDocuments({ approvalStatus: 'approved' });
    const rejectedCount = await Job.countDocuments({ approvalStatus: 'rejected' });
    const totalJobs = pendingCount + approvedCount + rejectedCount;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPending = await Job.countDocuments({
      approvalStatus: 'pending',
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentApproved = await Job.countDocuments({
      approvalStatus: 'approved',
      approvedAt: { $gte: sevenDaysAgo }
    });

    const recentRejected = await Job.countDocuments({
      approvalStatus: 'rejected',
      updatedAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      message: 'Job approval statistics retrieved successfully',
      data: {
        total: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: totalJobs
        },
        recent: {
          pending: recentPending,
          approved: recentApproved,
          rejected: recentRejected,
          total: recentPending + recentApproved + recentRejected
        },
        percentages: {
          pending: totalJobs > 0 ? ((pendingCount / totalJobs) * 100).toFixed(1) : 0,
          approved: totalJobs > 0 ? ((approvedCount / totalJobs) * 100).toFixed(1) : 0,
          rejected: totalJobs > 0 ? ((rejectedCount / totalJobs) * 100).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job approval statistics',
      error: error.message
    });
  }
};

// Get detailed job information for TPO
exports.getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('company', 'name email industry website phone')
      .populate('approvedBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const formattedJob = {
      id: job._id,
      title: job.title,
      description: job.description,
      location: job.location,
      package: job.package,
      eligibilityCriteria: job.eligibilityCriteria,
      deadline: job.deadline,
      compensation: job.compensation,
      timeline: job.timeline,
      status: job.status,
      approvalStatus: job.approvalStatus,
      company: {
        id: job.company._id,
        name: job.company.name,
        email: job.company.email,
        industry: job.company.industry,
        website: job.company.website,
        phone: job.company.phone
      },
      approvedBy: job.approvedBy ? {
        id: job.approvedBy._id,
        name: job.approvedBy.name,
        email: job.approvedBy.email
      } : null,
      approvedAt: job.approvedAt,
      rejectionReason: job.rejectionReason,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Job details retrieved successfully',
      data: formattedJob
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job details',
      error: error.message
    });
  }
};

