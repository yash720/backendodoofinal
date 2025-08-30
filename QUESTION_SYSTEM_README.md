# Question and Test System Documentation

## Overview
This system provides a complete question and test management solution for the Odoo Finals application. It allows TPOs to create question sets and questions, while students can take tests and view their results.

## Database Models

### 1. QuestionSet Model
**File:** `models/QuestionSet.js`

**Fields:**
- `title` (String, required): Name of the question set
- `description` (String, required): Detailed description of the test
- `maximumMarks` (Number, required): Total marks for the test
- `marksPerQuestion` (Number, required): Marks per individual question
- `totalQuestions` (Number, required): Number of questions in the set
- `timeLimit` (Number): Time limit in minutes (default: 60)
- `isActive` (Boolean): Whether the question set is active (default: true)
- `createdBy` (ObjectId, ref: 'TPO'): TPO who created the question set
- `questions` (Array of ObjectIds, ref: 'Question'): Questions in this set

### 2. Question Model
**File:** `models/Question.js`

**Fields:**
- `questionText` (String, required): The question text
- `options` (Object, required): Contains A, B, C, D options
- `correctAnswer` (String, enum: ['A', 'B', 'C', 'D'], required): Correct answer
- `marks` (Number, required): Marks for this question (default: 1)
- `explanation` (String): Explanation of the correct answer
- `difficulty` (String, enum: ['easy', 'medium', 'hard']): Question difficulty
- `category` (String): Question category/topic
- `createdBy` (ObjectId, ref: 'TPO'): TPO who created the question
- `questionSet` (ObjectId, ref: 'QuestionSet'): Question set this belongs to

### 3. StudentAnswer Model
**File:** `models/StudentAnswer.js`

**Fields:**
- `student` (ObjectId, ref: 'Student', required): Student taking the test
- `questionSet` (ObjectId, ref: 'QuestionSet', required): Question set being taken
- `answers` (Array): Array of student answers with details
- `totalMarksObtained` (Number): Total marks scored
- `totalMarksPossible` (Number, required): Maximum possible marks
- `percentage` (Number): Percentage score (auto-calculated)
- `startTime` (Date, required): When test started
- `endTime` (Date): When test ended
- `duration` (Number): Test duration in minutes
- `isCompleted` (Boolean): Whether test is completed
- `isSubmitted` (Boolean): Whether test is submitted

## API Endpoints

### Question Management (TPO Only)

#### Create Question Set
```
POST /api/questions/question-sets
Headers: Authorization: Bearer <token>
Body: {
  "title": "JavaScript Fundamentals Test",
  "description": "A comprehensive test covering JavaScript basics",
  "maximumMarks": 50,
  "marksPerQuestion": 5,
  "totalQuestions": 10,
  "timeLimit": 60
}
```

#### Get All Question Sets
```
GET /api/questions/question-sets
Headers: Authorization: Bearer <token>
```

#### Get Question Set by ID
```
GET /api/questions/question-sets/:id
Headers: Authorization: Bearer <token>
```

#### Update Question Set
```
PUT /api/questions/question-sets/:id
Headers: Authorization: Bearer <token>
Body: {
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Question Set
```
DELETE /api/questions/question-sets/:id
Headers: Authorization: Bearer <token>
```

#### Create Question
```
POST /api/questions/questions
Headers: Authorization: Bearer <token>
Body: {
  "questionText": "What is the output of console.log(typeof null)?",
  "options": {
    "A": "null",
    "B": "object",
    "C": "undefined",
    "D": "number"
  },
  "correctAnswer": "B",
  "marks": 5,
  "explanation": "In JavaScript, typeof null returns 'object'",
  "difficulty": "medium",
  "category": "JavaScript Basics",
  "questionSetId": "<question-set-id>"
}
```

#### Get All Questions
```
GET /api/questions/questions
Headers: Authorization: Bearer <token>
```

#### Update Question
```
PUT /api/questions/questions/:id
Headers: Authorization: Bearer <token>
Body: {
  "questionText": "Updated question text",
  "correctAnswer": "A"
}
```

#### Delete Question
```
DELETE /api/questions/questions/:id
Headers: Authorization: Bearer <token>
```

### Test Taking (Students)

#### Start Test
```
POST /api/tests/start/:questionSetId
Headers: Authorization: Bearer <token>
```

#### Submit Answer
```
POST /api/tests/:testSessionId/answer/:questionId
Headers: Authorization: Bearer <token>
Body: {
  "selectedAnswer": "B"
}
```

#### Submit Complete Test
```
POST /api/tests/:testSessionId/submit
Headers: Authorization: Bearer <token>
```

#### Get Test Results
```
GET /api/tests/results/:testSessionId
Headers: Authorization: Bearer <token>
```

#### Get All Test Results
```
GET /api/tests/results
Headers: Authorization: Bearer <token>
```

### Test Analytics (TPO Only)

#### Get Test Analytics
```
GET /api/tests/analytics/:questionSetId
Headers: Authorization: Bearer <token>
```

## Usage Examples

### 1. TPO Creating a Question Set
```javascript
// First, create a question set
const questionSetData = {
  title: "JavaScript Fundamentals Test",
  description: "A comprehensive test covering JavaScript basics",
  maximumMarks: 50,
  marksPerQuestion: 5,
  totalQuestions: 10,
  timeLimit: 60
};

// Then, create questions for the set
const questionData = {
  questionText: "What is the output of console.log(typeof null)?",
  options: {
    A: "null",
    B: "object",
    C: "undefined",
    D: "number"
  },
  correctAnswer: "B",
  marks: 5,
  explanation: "In JavaScript, typeof null returns 'object'",
  difficulty: "medium",
  category: "JavaScript Basics",
  questionSetId: "<question-set-id>"
};
```

### 2. Student Taking a Test
```javascript
// Start the test
const testSession = await fetch('/api/tests/start/questionSetId', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

// Submit answers
await fetch(`/api/tests/${testSessionId}/answer/${questionId}`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    selectedAnswer: 'B'
  })
});

// Submit complete test
await fetch(`/api/tests/${testSessionId}/submit`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

## Features

### For TPOs:
- Create and manage question sets
- Add questions with multiple choice options
- Set difficulty levels and categories
- View test analytics and student performance
- Track question success rates

### For Students:
- Take tests with time limits
- Submit answers question by question
- View detailed results with explanations
- Track performance across multiple tests
- See percentage scores and time taken

### System Features:
- Automatic scoring and percentage calculation
- Time tracking for tests
- Detailed analytics for question performance
- Role-based access control
- Comprehensive error handling

## Security Features

- JWT token authentication
- Role-based authorization (TPO, Student, Company)
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure password handling

## Error Handling

The system includes comprehensive error handling for:
- Invalid tokens
- Unauthorized access
- Missing required fields
- Invalid question formats
- Test session management
- Database connection issues

## Sample Data

See `sample-data.js` for example question sets and questions that can be used for testing the system.

