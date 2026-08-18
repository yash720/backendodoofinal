const Student = require('../models/Student');
const Application = require('../models/Application');
const Job = require('../models/Jobs');
const PlacementHistory = require('../models/PlacementHistory');

const StudentController = {
  // Dashboard
  getDashboard: async (req, res) => {
    try {
      const studentId = req.userId;
      
      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'No userId found in request'
        });
      }
      
      // Get student with populated data
      const student = await Student.findById(studentId)
        .populate('applications')
        .populate('placementHistory')
        .populate({
          path: 'applications',
          populate: [
            { path: 'job', populate: { path: 'company' } },
            { path: 'student' }
          ]
        });
      
      console.log('Student found:', student);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }
      
      // Simple welcome message
      const welcomeMessage = {
        message: `Welcome, ${student.name}!`,
        subtitle: `Here's your placement dashboard overview`
      };
      
      // Get detailed application statistics
      const applications = student.applications || [];
      const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'Applied').length,
        shortlistedApplications: applications.filter(app => app.status === 'Shortlisted').length,
        interviewApplications: applications.filter(app => app.status === 'Interview').length,
        offerApplications: applications.filter(app => app.status === 'Offer').length,
        placedApplications: applications.filter(app => app.status === 'Placed').length,
        rejectedApplications: applications.filter(app => app.status === 'Rejected').length
      };
      
      // Application Summary - Prominently displayed
      const applicationSummary = {
        totalCount: stats.totalApplications,
        statusBreakdown: {
          'Applied': stats.pendingApplications,
          'Shortlisted': stats.shortlistedApplications,
          'Interview': stats.interviewApplications,
          'Offer': stats.offerApplications,
          'Placed': stats.placedApplications,
          'Rejected': stats.rejectedApplications
        },
        successRate: stats.totalApplications > 0 ? 
          Math.round((stats.placedApplications / stats.totalApplications) * 100) : 0,
        recentActivity: applications.length > 0 ? 
          applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))[0].appliedAt : null
      };
      
      // Get placement information
      const placementInfo = {
        currentStatus: student.placementStatus || 'Not Placed',
        placementDetails: student.placementDetails || null,
        totalPlacements: student.placementHistory ? student.placementHistory.length : 0,
        activePlacements: student.placementHistory ? 
          student.placementHistory.filter(p => p.status === 'Active').length : 0
      };
      
      // Get recent applications with job details
      const recentApplications = applications
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 5) // Show last 5 applications
        .map(app => ({
          id: app._id,
          applicationNumber: `APP-${app._id.toString().slice(-6).toUpperCase()}`,
          jobTitle: app.job ? app.job.title : 'N/A',
          companyName: app.job && app.job.company ? app.job.company.name : 'N/A',
          status: app.status,
          appliedAt: app.appliedAt,
          lastUpdated: app.lastUpdated
        }));
      
      // Get placement history
      const placementHistory = student.placementHistory ? 
        student.placementHistory.map(p => ({
          id: p._id,
          companyName: p.company ? p.company.name : 'N/A',
          jobTitle: p.job ? p.job.title : 'N/A',
          placementDate: p.placementDate,
          package: p.package,
          status: p.status
        })) : [];
      
      res.json({
        success: true,
        welcomeMessage,
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
          branch: student.branch,
          graduationYear: student.graduationYear,
          cgpa: student.cgpa,
          skills: student.skills,
          phone: student.phone,
          address: student.address
        },
        applicationSummary,
        stats,
        placementInfo,
        recentApplications,
        placementHistory
      });
    } catch (error) {
      console.log('Dashboard error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get All Available Jobs (Home Page)
  getAllJobs: async (req, res) => {
    try {
      const studentId = req.userId;
      
      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'No userId found in request'
        });
      }

      // Get all approved and active jobs with company details
      const jobs = await Job.find({ 
        status: 'Open',
        approvalStatus: 'approved' // Only show approved jobs
      })
        .populate('company')
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

      // Filter only open jobs for students
      const openJobs = jobs.filter(job => job.status === 'Open');

      // Get student's applied job IDs to check if already applied
      const student = await Student.findById(studentId).populate('applications');
      const appliedJobIds = student.applications.map(app => app.job.toString());

      // Format jobs with simplified information for home page (like first image)
      const formattedJobs = openJobs.map(job => ({
        id: job._id,
        jobTitle: job.title,
        companyName: job.company ? job.company.name : 'N/A',
        city: job.location,
        compensation: job.package ? `${job.package} LPA` : 'Not specified',
        eligibility: job.eligibilityCriteria ? job.eligibilityCriteria.join(', ') : 'Not specified',
        branch: job.branch || 'All branches',
        deadline: job.deadline,
        daysUntilDeadline: getDaysUntilDeadline(job.deadline),
        isApplied: appliedJobIds.includes(job._id.toString())
      }));

      res.json({
        success: true,
        totalJobs: formattedJobs.length,
        openJobs: formattedJobs.length,
        closedJobs: jobs.length - openJobs.length,
        jobs: formattedJobs
      });
    } catch (error) {
      console.log('Get all jobs error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get Complete Job Details for View Details Page
  getJobDetails: async (req, res) => {
    try {
      const { jobId } = req.params;
      const studentId = req.userId;
      
      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'No userId found in request'
        });
      }

      // Get complete job details with company information
      const job = await Job.findById(jobId)
        .populate('company')
        .populate('applications');

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Check if job is approved and accessible to students
      if (job.approvalStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          error: 'This job is not available for viewing'
        });
      }

      // Check if student has already applied
      const hasApplied = job.applications.some(app => 
        app.student.toString() === studentId
      );

      // Format complete job details
      const jobDetails = {
        id: job._id,
        title: job.title,
        company: {
          id: job.company._id,
          name: job.company.name,
          email: job.company.email,
          phone: job.company.phone,
          address: job.company.address
        },
        location: job.location,
        package: job.package,
        description: job.description,
        overview: job.description, // For overview section
        eligibilityCriteria: job.eligibilityCriteria,
        branch: job.branch,
        deadline: job.deadline,
        status: job.status,
        compensation: {
          fixed: job.package,
          variable: job.package * 0.2, // Assuming 20% variable
          total: job.package * 1.2,
          otherBenefits: [
            'Health Insurance',
            'Joining Bonus',
            'Performance Bonus',
            'Stock Options'
          ]
        },
        skills: job.eligibilityCriteria || [],
        timeline: {
          onlineTest: job.timeline?.onlineTest || 'To be announced',
          interview: job.timeline?.interview || 'To be announced',
          finalOffer: job.timeline?.finalOffer || 'To be announced'
        },
        hasApplied: hasApplied,
        applicationCount: job.applications.length,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      };

      res.json({
        success: true,
        job: jobDetails
      });
    } catch (error) {
      console.log('Get job details error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get My Applications with Detailed Status
  getMyApplications: async (req, res) => {
    try {
      const studentId = req.userId;
      
      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'No userId found in request'
        });
      }

      // Get all applications for this student with detailed information
      const applications = await Application.find({ student: studentId })
        .populate({
          path: 'job',
          populate: { path: 'company' }
        })
        .populate('student')
        .sort({ appliedAt: -1 });

      // Format applications with detailed status information
      const formattedApplications = applications.map(app => ({
        id: app._id,
        applicationNumber: `APP-${app._id.toString().slice(-6).toUpperCase()}`,
        job: {
          id: app.job._id,
          title: app.job.title,
          description: app.job.description,
          location: app.job.location,
          package: app.job.package,
          deadline: app.job.deadline
        },
        company: {
          id: app.job.company._id,
          name: app.job.company.name,
          email: app.job.company.email
        },
        status: app.status,
        statusDetails: getStatusDetails(app.status),
        appliedAt: app.appliedAt,
        lastUpdated: app.lastUpdated,
        timeline: getApplicationTimeline(app.status, app.appliedAt)
      }));

      // Group applications by status
      const applicationsByStatus = {
        'Applied': formattedApplications.filter(app => app.status === 'Applied'),
        'Shortlisted': formattedApplications.filter(app => app.status === 'Shortlisted'),
        'Interview': formattedApplications.filter(app => app.status === 'Interview'),
        'Offer': formattedApplications.filter(app => app.status === 'Offer'),
        'Placed': formattedApplications.filter(app => app.status === 'Placed'),
        'Rejected': formattedApplications.filter(app => app.status === 'Rejected')
      };

      res.json({
        success: true,
        totalApplications: formattedApplications.length,
        applications: formattedApplications,
        applicationsByStatus,
        summary: {
          total: formattedApplications.length,
          applied: applicationsByStatus['Applied'].length,
          shortlisted: applicationsByStatus['Shortlisted'].length,
          interview: applicationsByStatus['Interview'].length,
          offer: applicationsByStatus['Offer'].length,
          placed: applicationsByStatus['Placed'].length,
          rejected: applicationsByStatus['Rejected'].length
        }
      });
    } catch (error) {
      console.log('Get my applications error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Update Profile
  updateProfile: async (req, res) => {
    try {
      const { name, branch, cgpa, skills, phone, address } = req.body;
      const studentId = req.userId;

      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { name, branch, cgpa, skills, phone, address },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        student: updatedStudent
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Upload Resume
  uploadResume: async (req, res) => {
    try {
      const { title, description, url } = req.body;
      const studentId = req.userId;

      const student = await Student.findById(studentId);
      student.resumes.push({
        title,
        description,
        url,
        uploadedAt: new Date()
      });
      await student.save();

      res.json({
        success: true,
        message: 'Resume uploaded successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // View Resumes
  viewResumes: async (req, res) => {
    try {
      const studentId = req.userId;
      const student = await Student.findById(studentId);
      
      res.json({
        success: true,
        resumes: student.resumes
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Apply for Job
  applyForJob: async (req, res) => {
    try {
      const { jobId } = req.params;
      const studentId = req.userId;

      // Check if already applied
      const existingApplication = await Application.findOne({
        student: studentId,
        job: jobId
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'Already applied for this job'
        });
      }

      // Create new application with timeline
      const application = new Application({
        student: studentId,
        job: jobId,
        status: 'Applied',
        currentStage: 'Applied',
        stageProgress: 16.67, // 1/6 stages
        timeline: {
          applied: {
            date: new Date(),
            completed: true
          }
        }
      });
      await application.save();

      // Add to student's applications
      await Student.findByIdAndUpdate(studentId, {
        $push: { applications: application._id }
      });

      // Add to job's applications
      await Job.findByIdAndUpdate(jobId, {
        $push: { applications: application._id }
      });

      res.json({
        success: true,
        message: 'Application submitted successfully',
        application: {
          id: application._id,
          applicationNumber: `APP-${application._id.toString().slice(-6).toUpperCase()}`,
          status: application.status,
          appliedAt: application.appliedAt
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get Applications (Legacy method)
  getApplications: async (req, res) => {
    try {
      const studentId = req.userId;
      const applications = await Application.find({ student: studentId })
        .populate('job')
        .populate({
          path: 'job',
          populate: { path: 'company' }
        })
        .sort({ appliedAt: -1 });

      // Add application numbers to each application
      const applicationsWithNumbers = applications.map(app => ({
        ...app.toObject(),
        applicationNumber: `APP-${app._id.toString().slice(-6).toUpperCase()}`
      }));

      res.json({
        success: true,
        totalApplications: applications.length,
        applications: applicationsWithNumbers
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get Placement History
  getPlacementHistory: async (req, res) => {
    try {
      const studentId = req.userId;
      const placementHistory = await PlacementHistory.find({ student: studentId })
        .populate('company')
        .populate('job')
        .populate('application')
        .sort({ placementDate: -1 });

      res.json({
        success: true,
        placementHistory
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
};

// Helper function to get status details
function getStatusDetails(status) {
  const statusInfo = {
    'Applied': {
      description: 'Your application has been submitted and is under review',
      color: 'blue',
      icon: '📝'
    },
    'Shortlisted': {
      description: 'Congratulations! You have been shortlisted for the next round',
      color: 'green',
      icon: '✅'
    },
    'Interview': {
      description: 'You have been selected for an interview. Please prepare well!',
      color: 'orange',
      icon: '🎯'
    },
    'Offer': {
      description: 'Excellent! You have received a job offer',
      color: 'purple',
      icon: '🎉'
    },
    'Placed': {
      description: 'Congratulations! You have been successfully placed',
      color: 'success',
      icon: '🏆'
    },
    'Rejected': {
      description: 'Unfortunately, your application was not selected this time',
      color: 'red',
      icon: '❌'
    }
  };
  
  return statusInfo[status] || {
    description: 'Status information not available',
    color: 'gray',
    icon: '❓'
  };
}

// Helper function to get application timeline
function getApplicationTimeline(status, appliedAt) {
  const timeline = {
    'Applied': {
      step: 1,
      completed: true,
      date: appliedAt
    },
    'Shortlisted': {
      step: 2,
      completed: status === 'Shortlisted' || status === 'Interview' || status === 'Offer' || status === 'Placed',
      date: null
    },
    'Interview': {
      step: 3,
      completed: status === 'Interview' || status === 'Offer' || status === 'Placed',
      date: null
    },
    'Offer': {
      step: 4,
      completed: status === 'Offer' || status === 'Placed',
      date: null
    },
    'Placed': {
      step: 5,
      completed: status === 'Placed',
      date: null
    }
  };
  
  return timeline;
}

// Helper function to calculate days until deadline
function getDaysUntilDeadline(deadline) {
  const currentDate = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - currentDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      status: 'expired',
      message: `Expired ${Math.abs(diffDays)} day(s) ago`
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      status: 'today',
      message: 'Deadline is today!'
    };
  } else {
    return {
      days: diffDays,
      status: 'remaining',
      message: `${diffDays} day(s) remaining`
    };
  }
}

module.exports = StudentController;
