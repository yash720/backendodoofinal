# Job Approval System Documentation

## Overview
This system implements a job approval workflow where companies can create job listings, but they only become visible to students after TPO approval. This ensures quality control and proper vetting of job opportunities.

## Database Changes

### Updated Jobs Model (`models/Jobs.js`)
Added new fields to track approval status:

- `approvalStatus` (String, enum: ['pending', 'approved', 'rejected'], default: 'pending')
- `approvedBy` (ObjectId, ref: 'TPO') - TPO who approved/rejected the job
- `approvedAt` (Date) - When the job was approved
- `rejectionReason` (String) - Reason for rejection if applicable

## Workflow

### 1. Company Creates Job
- Company creates a new job listing
- Job is automatically set to `approvalStatus: 'pending'`
- Job status is set to `'Closed'` (not visible to students)
- Job appears in TPO's pending requests panel

### 2. TPO Reviews Job
- TPO can view all pending job requests
- TPO can approve or reject jobs with reasons
- Approved jobs become visible to students
- Rejected jobs remain closed with rejection reason

### 3. Students View Jobs
- Students only see approved and active jobs
- Students cannot access pending or rejected jobs
- Job details are fully available for approved jobs

## API Endpoints

### Company Job Creation (Existing - Updated)
```
POST /api/company/create-job
Headers: Authorization: Bearer <company-token>
Body: {
  "title": "Software Engineer",
  "description": "Job description...",
  "location": "Mumbai",
  "package": 800000,
  "eligibilityCriteria": ["B.Tech", "CGPA > 7.5"],
  "deadline": "2024-12-31",
  "compensation": {
    "fixed": 800000,
    "variable": 200000
  },
  "timeline": {
    "onlineTest": "2024-12-15",
    "interview": "2024-12-20",
    "finalOffer": "2024-12-25"
  }
}
```

### TPO Job Approval Management

#### Get Pending Jobs
```
GET /api/tpo/job-approval/pending
Headers: Authorization: Bearer <tpo-token>
```

#### Get Approved Jobs
```
GET /api/tpo/job-approval/approved
Headers: Authorization: Bearer <tpo-token>
```

#### Get Rejected Jobs
```
GET /api/tpo/job-approval/rejected
Headers: Authorization: Bearer <tpo-token>
```

#### Get Job Approval Statistics
```
GET /api/tpo/job-approval/stats
Headers: Authorization: Bearer <tpo-token>
```

#### Get Detailed Job Information
```
GET /api/tpo/job-approval/job/:jobId
Headers: Authorization: Bearer <tpo-token>
```

#### Approve a Job
```
POST /api/tpo/job-approval/approve/:jobId
Headers: Authorization: Bearer <tpo-token>
```

#### Reject a Job
```
POST /api/tpo/job-approval/reject/:jobId
Headers: Authorization: Bearer <tpo-token>
Body: {
  "rejectionReason": "Incomplete job description or insufficient details"
}
```

### Student Job Viewing (Updated)
```
GET /api/student/home
Headers: Authorization: Bearer <student-token>
```
*Now only returns approved jobs*

```
GET /api/student/job/:jobId
Headers: Authorization: Bearer <student-token>
```
*Now checks approval status before allowing access*

## Response Formats

### Pending Jobs Response
```json
{
  "success": true,
  "message": "Pending jobs retrieved successfully",
  "data": {
    "totalPending": 5,
    "jobs": [
      {
        "id": "job_id",
        "title": "Software Engineer",
        "description": "Job description...",
        "location": "Mumbai",
        "package": 800000,
        "eligibilityCriteria": ["B.Tech", "CGPA > 7.5"],
        "deadline": "2024-12-31",
        "company": {
          "id": "company_id",
          "name": "Tech Corp",
          "email": "hr@techcorp.com",
          "industry": "Technology"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "daysSinceCreated": 2
      }
    ]
  }
}
```

### Job Approval Statistics
```json
{
  "success": true,
  "message": "Job approval statistics retrieved successfully",
  "data": {
    "total": {
      "pending": 5,
      "approved": 25,
      "rejected": 3,
      "total": 33
    },
    "recent": {
      "pending": 2,
      "approved": 8,
      "rejected": 1,
      "total": 11
    },
    "percentages": {
      "pending": "15.2",
      "approved": "75.8",
      "rejected": "9.1"
    }
  }
}
```

## Features

### For Companies:
- Create job listings with full details
- View all their jobs with approval status
- See rejection reasons if jobs are rejected
- Track approval timeline

### For TPOs:
- View pending job requests in dashboard
- Review job details before approval
- Approve jobs to make them visible
- Reject jobs with specific reasons
- View approval statistics and analytics
- Track all approved/rejected jobs

### For Students:
- Only see approved and active jobs
- Cannot access pending or rejected jobs
- Full job details for approved positions
- Apply only to approved jobs

## Security Features

- **Role-based access**: Only TPOs can approve/reject jobs
- **Status validation**: Students cannot access unapproved jobs
- **Audit trail**: Track who approved/rejected and when
- **Reason tracking**: Rejection reasons for transparency

## Error Handling

The system includes comprehensive error handling for:
- Unauthorized access attempts
- Invalid job status transitions
- Missing required fields
- Job not found scenarios
- Approval status validation

## Database Queries

### Find Pending Jobs
```javascript
const pendingJobs = await Job.find({ approvalStatus: 'pending' })
  .populate('company', 'name email industry')
  .sort({ createdAt: -1 });
```

### Find Approved Jobs for Students
```javascript
const approvedJobs = await Job.find({ 
  status: 'Open',
  approvalStatus: 'approved' 
})
  .populate('company')
  .sort({ createdAt: -1 });
```

### Update Job Approval Status
```javascript
job.approvalStatus = 'approved';
job.approvedBy = tpoId;
job.approvedAt = new Date();
job.status = 'Open'; // Make visible to students
await job.save();
```

## Usage Examples

### 1. Company Creates Job
```javascript
const jobData = {
  title: "Software Engineer",
  description: "We are looking for a talented software engineer...",
  location: "Mumbai",
  package: 800000,
  eligibilityCriteria: ["B.Tech", "CGPA > 7.5"],
  deadline: "2024-12-31"
};

const response = await fetch('/api/company/create-job', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + companyToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jobData)
});
```

### 2. TPO Approves Job
```javascript
const response = await fetch('/api/tpo/job-approval/approve/job_id', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + tpoToken
  }
});
```

### 3. TPO Rejects Job
```javascript
const response = await fetch('/api/tpo/job-approval/reject/job_id', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + tpoToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rejectionReason: "Job description is incomplete. Please provide more details about responsibilities and requirements."
  })
});
```

### 4. Student Views Approved Jobs
```javascript
const response = await fetch('/api/student/home', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken
  }
});
```

## Benefits

1. **Quality Control**: TPOs can ensure job quality before students see them
2. **Transparency**: Clear approval/rejection process with reasons
3. **Security**: Students only see vetted job opportunities
4. **Analytics**: TPOs can track approval rates and patterns
5. **Audit Trail**: Complete history of job approvals and rejections
