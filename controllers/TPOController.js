const Job = require('../models/Jobs');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');

const TPOController = {
  // Create Job
  createJob: async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        package,
        eligibilityCriteria,
        company,
        deadline,
        compensation,
        timeline
      } = req.body;

      const job = new Job({
        title,
        description,
        location,
        package,
        eligibilityCriteria,
        company,
        deadline,
        compensation,
        timeline
      });

      await job.save();

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

  // Update Job
  updateJob: async (req, res) => {
    try {
      const { jobId } = req.params;
      const updateData = req.body;

      const job = await Job.findByIdAndUpdate(
        jobId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      res.json({
        success: true,
        message: 'Job updated successfully',
        job
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Delete Job
  deleteJob: async (req, res) => {
    try {
      const { jobId } = req.params;

      const job = await Job.findByIdAndDelete(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // View Applications
  viewApplications: async (req, res) => {
    try {
      const applications = await Application.find()
        .populate('student')
        .populate('job')
        .populate({
          path: 'job',
          populate: { path: 'company' }
        })
        .sort({ appliedAt: -1 });

      res.json({
        success: true,
        applications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Generate Reports
  generateReports: async (req, res) => {
    try {
      const totalStudents = await Student.countDocuments();
      const totalCompanies = await Company.countDocuments();
      const totalJobs = await Job.countDocuments();
      const totalApplications = await Application.countDocuments();

      // Placement statistics
      const placedApplications = await Application.countDocuments({ status: 'Placed' });
      const placementRate = totalApplications > 0 ? (placedApplications / totalApplications * 100).toFixed(2) : 0;

      // Company-wise statistics
      const companyStats = await Company.aggregate([
        {
          $lookup: {
            from: 'jobs',
            localField: '_id',
            foreignField: 'company',
            as: 'jobs'
          }
        },
        {
          $project: {
            name: 1,
            totalJobs: { $size: '$jobs' },
            totalApplications: 1
          }
        }
      ]);

      const report = {
        totalStudents,
        totalCompanies,
        totalJobs,
        totalApplications,
        placedApplications,
        placementRate: `${placementRate}%`,
        companyStats
      };

      res.json({
        success: true,
        report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = TPOController;
