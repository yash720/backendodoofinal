# Ranking and Leaderboard System Documentation

## Overview
This system implements a comprehensive ranking and leaderboard functionality where students earn points from taking quizzes and practice tests. The system automatically tracks scores, assigns badges, and maintains a real-time leaderboard.

## Database Changes

### Updated Student Model (`models/Student.js`)
Added new fields for ranking and scoring:

- `totalScore` (Number, default: 0) - Total points from all quizzes
- `quizScores` (Array) - Detailed quiz performance history
- `badges` (Array) - Achievement badges earned
- `rank` (Number, default: 0) - Current ranking position
- `totalQuizzesTaken` (Number, default: 0) - Number of quizzes completed
- `averageScore` (Number, default: 0) - Average score across all quizzes
- `highestScore` (Number, default: 0) - Highest single quiz score

## Badge System

### Available Badges:
- **Top Scorer** - Highest total score in the campus
- **Consistent Performer** - Average score ≥ 80%
- **Rising Star** - Showing improvement in recent quizzes
- **Quiz Master** - Completed 10+ quizzes
- **Perfect Score** - Achieved 100% on any quiz
- **Knowledge Seeker** - Completed 5+ quizzes
- **First Place** - Ranked #1 overall
- **Top 10** - Ranked in top 10
- **Top 25** - Ranked in top 25

## Workflow

### 1. Student Takes Quiz
- Student completes a quiz/test
- Score is automatically calculated
- Student's total score is updated
- Badges are assigned based on performance
- All students' ranks are recalculated

### 2. Leaderboard Display
- Students can view campus leaderboard
- Current user's rank appears at the top
- Shows scores, badges, and ranking
- Real-time updates after each quiz

### 3. Personal Ranking
- Students can view their personal ranking details
- Shows performance trends and statistics
- Displays recent quiz history

## API Endpoints

### Get Campus Leaderboard
```
GET /api/ranking/leaderboard
Headers: Authorization: Bearer <student-token>
```

### Get Personal Ranking Details
```
GET /api/ranking/my-ranking
Headers: Authorization: Bearer <student-token>
```

### Get Top Performers
```
GET /api/ranking/top-performers?limit=10
Headers: Authorization: Bearer <student-token>
```

### Get Ranking Statistics
```
GET /api/ranking/stats
Headers: Authorization: Bearer <student-token>
```

## Response Formats

### Campus Leaderboard Response
```json
{
  "success": true,
  "message": "Campus leaderboard retrieved successfully",
  "data": {
    "totalStudents": 150,
    "currentUserRank": 8,
    "currentUserScore": 880,
    "leaderboard": [
      {
        "rank": 8,
        "studentName": "John Doe",
        "score": 880,
        "badges": ["Your Rank", "Consistent Performer"],
        "totalQuizzesTaken": 5,
        "averageScore": 88.0,
        "highestScore": 95,
        "isCurrentUser": true
      },
      {
        "rank": 1,
        "studentName": "Alice Johnson",
        "score": 980,
        "badges": ["Top Scorer", "First Place", "Perfect Score"],
        "totalQuizzesTaken": 8,
        "averageScore": 98.0,
        "highestScore": 100,
        "isCurrentUser": false
      },
      {
        "rank": 2,
        "studentName": "Ravi Kumar",
        "score": 940,
        "badges": ["Consistent Performer", "Top 10"],
        "totalQuizzesTaken": 6,
        "averageScore": 94.0,
        "highestScore": 98,
        "isCurrentUser": false
      }
    ]
  }
}
```

### Personal Ranking Response
```json
{
  "success": true,
  "message": "Student ranking details retrieved successfully",
  "data": {
    "student": {
      "name": "John Doe",
      "totalScore": 880,
      "rank": 8,
      "totalStudents": 150,
      "badges": ["Consistent Performer", "Knowledge Seeker"],
      "totalQuizzesTaken": 5,
      "averageScore": 88.0,
      "highestScore": 95
    },
    "recentQuizzes": [
      {
        "quizId": "quiz_id",
        "score": 95,
        "percentage": 95.0,
        "completedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "performanceTrend": {
      "trend": "improving",
      "message": "Your performance is improving!"
    }
  }
}
```

### Top Performers Response
```json
{
  "success": true,
  "message": "Top performers retrieved successfully",
  "data": {
    "topPerformers": [
      {
        "rank": 1,
        "studentName": "Alice Johnson",
        "score": 980,
        "badges": ["Top Scorer", "First Place"]
      },
      {
        "rank": 2,
        "studentName": "Ravi Kumar",
        "score": 940,
        "badges": ["Consistent Performer"]
      }
    ]
  }
}
```

## Features

### For Students:
- **Real-time Leaderboard** - See current rankings
- **Personal Ranking** - View your position and progress
- **Badge System** - Earn achievements for performance
- **Performance Tracking** - Monitor improvement over time
- **Score History** - View all quiz results

### For System:
- **Automatic Scoring** - Scores updated after each quiz
- **Dynamic Rankings** - Ranks recalculated automatically
- **Badge Assignment** - Achievements awarded based on criteria
- **Performance Analytics** - Track trends and statistics

## Score Calculation

### Total Score
- Sum of all quiz scores taken
- Includes both practice tests and exams
- Accumulates over time

### Average Score
- Total score divided by number of quizzes taken
- Used for badge assignment and ranking ties

### Ranking Logic
1. **Primary**: Total score (highest first)
2. **Secondary**: Average score (highest first)
3. **Tertiary**: Number of quizzes taken (most first)

## Badge Assignment Logic

### Automatic Badge Assignment:
```javascript
// Perfect Score
if (student.highestScore >= 100) {
  badges.add('Perfect Score');
}

// Top Scorer (Rank #1)
if (studentRank === 1) {
  badges.add('Top Scorer');
  badges.add('First Place');
}

// Consistent Performer
if (student.averageScore >= 80) {
  badges.add('Consistent Performer');
}

// Quiz Master
if (student.totalQuizzesTaken >= 10) {
  badges.add('Quiz Master');
}
```

## Performance Trends

### Trend Calculation:
- Analyzes last 5 quiz performances
- Determines if scores are improving, declining, or stable
- Provides motivational feedback

### Trend Types:
- **Improving** - Recent scores are better than previous
- **Declining** - Recent scores are worse than previous
- **Stable** - Consistent performance

## Database Queries

### Get All Students Sorted by Score
```javascript
const allStudents = await Student.find()
  .select('name totalScore badges rank')
  .sort({ totalScore: -1, averageScore: -1 });
```

### Update Student Score
```javascript
student.quizScores.push({
  quizId,
  score,
  percentage,
  completedAt: new Date()
});

student.totalScore = student.quizScores.reduce((total, quiz) => total + quiz.score, 0);
student.averageScore = student.totalScore / student.quizScores.length;
```

### Update All Ranks
```javascript
const students = await Student.find().sort({ totalScore: -1 });
for (let i = 0; i < students.length; i++) {
  students[i].rank = i + 1;
  await students[i].save();
}
```

## Usage Examples

### 1. View Campus Leaderboard
```javascript
const response = await fetch('/api/ranking/leaderboard', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken
  }
});

const data = await response.json();
console.log('My rank:', data.data.currentUserRank);
console.log('Leaderboard:', data.data.leaderboard);
```

### 2. Get Personal Ranking
```javascript
const response = await fetch('/api/ranking/my-ranking', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken
  }
});

const data = await response.json();
console.log('My score:', data.data.student.totalScore);
console.log('My badges:', data.data.student.badges);
```

### 3. View Top Performers
```javascript
const response = await fetch('/api/ranking/top-performers?limit=5', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + studentToken
  }
});

const data = await response.json();
console.log('Top 5:', data.data.topPerformers);
```

## Integration with Quiz System

### Automatic Score Update:
When a student completes a quiz:
1. Quiz score is calculated
2. Student's total score is updated
3. Badges are reassigned
4. All students' ranks are recalculated
5. Leaderboard is updated in real-time

### Score Sources:
- Practice tests
- Question sets
- Mock exams
- Any quiz with scoring

## Benefits

1. **Motivation** - Students compete for top positions
2. **Recognition** - Badges provide achievement recognition
3. **Progress Tracking** - Monitor improvement over time
4. **Engagement** - Leaderboard encourages participation
5. **Transparency** - Clear ranking system
6. **Real-time Updates** - Instant feedback after quizzes

## Security Features

- **Role-based Access** - Only students can view rankings
- **Personal Data Protection** - Students see their own details
- **Score Validation** - Scores validated before updating
- **Audit Trail** - Complete quiz history maintained

