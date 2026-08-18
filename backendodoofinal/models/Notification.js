const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'deadline_reminder',
      'exam_notification',
      'new_opportunity',
      'application_update',
      'interview_scheduled',
      'offer_received',
      'placement_achieved',
      'quiz_reminder',
      'general_announcement'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  relatedData: {

    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },

    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },

    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet' },

    deadlineDate: Date,

    interviewDate: Date,
    interviewLocation: String,

    offerDetails: {
      package: Number,
      joiningDate: Date,
      companyName: String
    }
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: String,
  expiresAt: Date
}, {
  timestamps: true
});

notificationSchema.index({ student: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

