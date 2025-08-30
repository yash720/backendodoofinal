# Placement Timeline & Notifications System Documentation

## Overview
This system implements a comprehensive **Placement Timeline** visualization and **Daily Updates/Notifications** system that tracks student progress through the placement process and provides real-time updates about deadlines, exams, and new opportunities.

## 🎯 **Key Features Implemented:**

### **1. Placement Timeline Visualization**
- **Visual Progress Tracking**: Applied → Test → Shortlisted → Interview → Offer → Placed
- **Stage-by-Stage Progress**: Each stage shows completion status, dates, and details
- **Progress Percentage**: Real-time calculation of overall placement progress
- **Timeline Details**: Comprehensive information for each stage

### **2. Daily Updates & Notifications**
- **Real-time Notifications**: Instant updates for application status changes
- **Deadline Reminders**: Automated reminders for upcoming deadlines
- **New Opportunities**: Notifications about new job postings
- **Exam Notifications**: Quiz and test reminders
- **Priority System**: Urgent, High, Medium, Low priority notifications

## Database Changes

### **New Notification Model (`models/Notification.js`)**
```javascript
{
  student: ObjectId,
  title: String,
  message: String,
  type: Enum['deadline_reminder', 'exam_notification', 'new_opportunity', 'application_update', 'interview_scheduled', 'offer_received', 'placement_achieved', 'quiz_reminder', 'general_announcement'],
  priority: Enum['low', 'medium', 'high', 'urgent'],
  isRead: Boolean,
  relatedData: {
    applicationId: ObjectId,
    jobId: ObjectId,
    quizId: ObjectId,
    deadlineDate: Date,
    interviewDate: Date,
    offerDetails: Object
  },
  actionRequired: Boolean,
  actionUrl: String,
  expiresAt: Date
}
```

### **Enhanced Application Model (`models/Application.js`)**
Added comprehensive timeline tracking:
```javascript
{
  timeline: {
    applied: { date: Date, completed: Boolean },
    test: { date: Date, completed: Boolean, score: Number, location: String, instructions: String },
    shortlisted: { date: Date, completed: Boolean, message: String },
    interview: { date: Date, completed: Boolean, location: String, type: String, interviewer: String, duration: String, instructions: String },
    offer: { date: Date, completed: Boolean, package: Object, joiningDate: Date, offerLetterUrl: String, acceptanceDeadline: Date },
    placed: { date: Date, completed: Boolean, joiningDate: Date, companyLocation: String }
  },
  currentStage: String,
  stageProgress: Number,
  nextDeadline: Date,
  notes: Array,
  documents: Array
}
```

## API Endpoints

### **Placement Timeline**
```
GET    /api/timeline/placement-timeline     - Get student's placement timeline
GET    /api/timeline/application/:id        - Get detailed application timeline
```

### **Daily Updates & Notifications**
```
GET    /api/timeline/daily-updates          - Get notifications and updates
PUT    /api/timeline/notifications/:id/read - Mark notification as read
PUT    /api/timeline/notifications/read-all - Mark all notifications as read
DELETE /api/timeline/notifications/:id      - Delete notification
```

### **Application Stage Management (Company/TPO)**
```
PUT    /api/timeline/applications/:id/stage - Update application stage
```

## Response Formats

### **Placement Timeline Response**
```json
{
  "success": true,
  "message": "Placement timeline retrieved successfully",
  "data": {
    "timelineData": [
      {
        "applicationId": "app_id",
        "job": {
          "id": "job_id",
          "title": "Software Engineer",
          "company": {
            "name": "Tech Corp",
            "logo": "logo_url"
          },
          "location": "Mumbai",
          "package": 800000
        },
        "currentStatus": "Interview",
        "currentStage": "Interview",
        "stageProgress": 66.67,
        "appliedAt": "2024-01-15T10:30:00.000Z",
        "lastUpdated": "2024-01-20T14:00:00.000Z",
        "nextDeadline": "2024-01-25T09:00:00.000Z",
        "timeline": [
          {
            "stage": "Applied",
            "date": "2024-01-15T10:30:00.000Z",
            "completed": true,
            "status": "completed",
            "icon": "📝",
            "description": "Application submitted successfully"
          },
          {
            "stage": "Test",
            "date": "2024-01-18T14:00:00.000Z",
            "completed": true,
            "status": "completed",
            "icon": "📊",
            "description": "Test completed with score: 85"
          },
          {
            "stage": "Shortlisted",
            "date": "2024-01-19T16:00:00.000Z",
            "completed": true,
            "status": "completed",
            "icon": "✅",
            "description": "Successfully shortlisted for next round"
          },
          {
            "stage": "Interview",
            "date": "2024-01-25T09:00:00.000Z",
            "completed": false,
            "status": "pending",
            "icon": "🎯",
            "description": "Interview scheduled for 25 Jan 2024",
            "details": {
              "location": "Tech Corp Office, Mumbai",
              "type": "Offline",
              "interviewer": "John Smith",
              "duration": "1 hour",
              "instructions": "Please bring your ID proof and portfolio"
            }
          },
          {
            "stage": "Offer",
            "date": null,
            "completed": false,
            "status": "pending",
            "icon": "🎉",
            "description": "Awaiting offer"
          },
          {
            "stage": "Placed",
            "date": null,
            "completed": false,
            "status": "pending",
            "icon": "🏆",
            "description": "Final placement stage"
          }
        ],
        "overallProgress": 50
      }
    ],
    "statistics": {
      "totalApplications": 5,
      "activeApplications": 3,
      "placedApplications": 1,
      "placementRate": "20.0"
    }
  }
}
```

### **Daily Updates Response**
```json
{
  "success": true,
  "message": "Daily updates retrieved successfully",
  "data": {
    "notifications": [
      {
        "id": "notif_id",
        "title": "Interview Scheduled",
        "message": "Interview scheduled for Software Engineer on 25 Jan 2024",
        "type": "interview_scheduled",
        "priority": "high",
        "isRead": false,
        "relatedData": {
          "applicationId": "app_id",
          "interviewDate": "2024-01-25T09:00:00.000Z",
          "interviewLocation": "Tech Corp Office, Mumbai"
        },
        "actionRequired": true,
        "actionUrl": "/applications/app_id",
        "createdAt": "2024-01-20T14:00:00.000Z"
      }
    ],
    "unreadCount": 3,
    "upcomingDeadlines": [
      {
        "type": "application_deadline",
        "title": "Deadline for Software Engineer",
        "deadline": "2024-01-25T09:00:00.000Z",
        "applicationId": "app_id",
        "jobTitle": "Software Engineer",
        "companyName": "Tech Corp"
      }
    ],
    "recentOpportunities": [
      {
        "id": "job_id",
        "title": "Data Scientist",
        "company": "AI Solutions",
        "industry": "Technology",
        "location": "Bangalore",
        "package": 1200000,
        "createdAt": "2024-01-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15
    }
  }
}
```

## Timeline Stages & Progress

### **Stage 1: Applied (16.67%)**
- ✅ **Status**: Always completed when application is submitted
- 📝 **Icon**: Document submission
- 📅 **Date**: Application submission date

### **Stage 2: Test (33.33%)**
- 📊 **Icon**: Test/exam
- 📍 **Location**: Test center or online platform
- 📋 **Instructions**: Test guidelines and requirements
- 🎯 **Score**: Test performance (if completed)

### **Stage 3: Shortlisted (50%)**
- ✅ **Icon**: Success checkmark
- 💬 **Message**: Shortlisting notification
- 🎉 **Priority**: High priority notification

### **Stage 4: Interview (66.67%)**
- 🎯 **Icon**: Target/aim
- 📍 **Location**: Interview venue
- 👤 **Interviewer**: Interviewer details
- ⏱️ **Duration**: Interview duration
- 📋 **Instructions**: Interview preparation guidelines

### **Stage 5: Offer (83.33%)**
- 🎉 **Icon**: Celebration
- 💰 **Package**: Salary and benefits details
- 📅 **Joining Date**: Expected joining date
- 📄 **Offer Letter**: Offer letter URL
- ⏰ **Acceptance Deadline**: Offer acceptance deadline

### **Stage 6: Placed (100%)**
- 🏆 **Icon**: Trophy/achievement
- 📅 **Joining Date**: Actual joining date
- 🏢 **Company Location**: Final work location

## Notification Types

### **1. Application Updates**
- **Test Scheduled**: When test is scheduled
- **Shortlisted**: When application is shortlisted
- **Interview Scheduled**: When interview is scheduled
- **Offer Received**: When offer is received
- **Placement Achieved**: When successfully placed

### **2. Deadline Reminders**
- **Application Deadlines**: Job application deadlines
- **Test Deadlines**: Upcoming test dates
- **Interview Deadlines**: Interview preparation deadlines
- **Offer Deadlines**: Offer acceptance deadlines

### **3. New Opportunities**
- **New Job Postings**: Recently posted jobs
- **Matching Opportunities**: Jobs matching student profile
- **Company Events**: Placement drives and events

### **4. Exam Notifications**
- **Quiz Reminders**: Practice quiz reminders
- **Test Notifications**: Upcoming tests
- **Performance Updates**: Quiz results and rankings

## Usage Examples

### **1. View Placement Timeline**
```javascript
const response = await fetch('/api/timeline/placement-timeline', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken
  }
});

const data = await response.json();
console.log('Timeline:', data.data.timelineData);
console.log('Progress:', data.data.statistics);
```

### **2. Get Daily Updates**
```javascript
const response = await fetch('/api/timeline/daily-updates?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken
  }
});

const data = await response.json();
console.log('Notifications:', data.data.notifications);
console.log('Unread Count:', data.data.unreadCount);
console.log('Deadlines:', data.data.upcomingDeadlines);
```

### **3. Update Application Stage (Company/TPO)**
```javascript
const response = await fetch('/api/timeline/applications/app_id/stage', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + companyToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    stage: 'Interview',
    details: {
      date: '2024-01-25T09:00:00.000Z',
      location: 'Tech Corp Office, Mumbai',
      type: 'Offline',
      interviewer: 'John Smith',
      duration: '1 hour',
      instructions: 'Please bring your ID proof and portfolio'
    },
    message: 'Interview scheduled successfully'
  })
});
```

### **4. Mark Notification as Read**
```javascript
const response = await fetch('/api/timeline/notifications/notif_id/read', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + studentToken
  }
});
```

## Integration with Existing Systems

### **Automatic Notifications**
- **Job Application**: Creates notification when student applies
- **Stage Updates**: Automatic notifications when companies update stages
- **Quiz Completion**: Notifications for quiz results and ranking updates
- **Deadline Tracking**: Automated deadline reminders

### **Real-time Updates**
- **Timeline Progress**: Updates in real-time as stages are completed
- **Notification Count**: Live unread notification count
- **Progress Percentage**: Dynamic calculation of placement progress

## Benefits

### **For Students:**
1. **Visual Progress Tracking**: Clear visualization of placement journey
2. **Real-time Updates**: Instant notifications about status changes
3. **Deadline Management**: Never miss important deadlines
4. **Opportunity Discovery**: Stay updated with new opportunities
5. **Progress Motivation**: See progress and stay motivated

### **For Companies:**
1. **Efficient Communication**: Automated notifications to candidates
2. **Stage Management**: Easy stage updates with notifications
3. **Candidate Tracking**: Monitor candidate progress through timeline
4. **Deadline Management**: Automated deadline reminders

### **For TPOs:**
1. **Placement Monitoring**: Track overall placement progress
2. **Student Support**: Help students with timeline guidance
3. **Analytics**: Placement statistics and success rates
4. **Communication**: Send announcements and updates

## Security Features

- **Role-based Access**: Different permissions for students, companies, and TPOs
- **Personal Data Protection**: Students only see their own timeline and notifications
- **Secure Updates**: Only authorized users can update application stages
- **Audit Trail**: Complete history of timeline changes and notifications

## Performance Optimizations

- **Indexed Queries**: Efficient database queries with proper indexing
- **Pagination**: Paginated notifications for better performance
- **Caching**: Frequently accessed data caching
- **Real-time Updates**: WebSocket support for live updates (future enhancement)

This comprehensive system ensures that students have complete visibility into their placement journey with real-time updates and notifications, making the placement process more transparent and engaging.

