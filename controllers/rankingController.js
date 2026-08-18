const Student = require('../models/Student');
const StudentAnswer = require('../models/StudentAnswer');
const QuestionSet = require('../models/QuestionSet');

// Get campus leaderboard
exports.getCampusLeaderboard = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all students with their scores, sorted by total score (descending)
    const allStudents = await Student.find()
      .select('name totalScore badges rank totalQuizzesTaken averageScore highestScore')
      .sort({ totalScore: -1, averageScore: -1 });

    // Find current user's position
    const currentUserIndex = allStudents.findIndex(student => 
      student._id.toString() === currentUserId
    );

    // Get current user's data
    const currentUser = currentUserIndex !== -1 ? allStudents[currentUserIndex] : null;

    // Format leaderboard data
    const leaderboard = allStudents.map((student, index) => ({
      rank: index + 1,
      studentName: student.name,
      score: student.totalScore,
      badges: student.badges,
      totalQuizzesTaken: student.totalQuizzesTaken,
      averageScore: student.averageScore,
      highestScore: student.highestScore,
      isCurrentUser: student._id.toString() === currentUserId
    }));

    // If current user exists, move them to top
    let formattedLeaderboard = leaderboard;
    if (currentUser) {
      const currentUserEntry = leaderboard.find(entry => entry.isCurrentUser);
      if (currentUserEntry) {
        formattedLeaderboard = [
          currentUserEntry,
          ...leaderboard.filter(entry => !entry.isCurrentUser)
        ];
      }
    }

    res.status(200).json({
      success: true,
      message: 'Campus leaderboard retrieved successfully',
      data: {
        totalStudents: allStudents.length,
        currentUserRank: currentUserIndex !== -1 ? currentUserIndex + 1 : null,
        currentUserScore: currentUser ? currentUser.totalScore : 0,
        leaderboard: formattedLeaderboard
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching campus leaderboard',
      error: error.message
    });
  }
};

// Update student score after quiz completion
exports.updateStudentScore = async (req, res) => {
  try {
    const { studentId, quizId, score, percentage } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Add quiz score to student's quiz scores
    student.quizScores.push({
      quizId,
      score,
      percentage,
      completedAt: new Date()
    });

    // Update total score (sum of all quiz scores)
    student.totalScore = student.quizScores.reduce((total, quiz) => total + quiz.score, 0);
    
    // Update quiz count
    student.totalQuizzesTaken = student.quizScores.length;
    
    // Update average score
    student.averageScore = student.totalScore / student.totalQuizzesTaken;
    
    // Update highest score
    student.highestScore = Math.max(student.highestScore, score);

    // Assign badges based on performance
    await assignBadges(student);

    await student.save();

    // Update all students' ranks
    await updateAllRanks();

    res.status(200).json({
      success: true,
      message: 'Student score updated successfully',
      data: {
        studentId: student._id,
        totalScore: student.totalScore,
        newBadges: student.badges,
        rank: student.rank
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student score',
      error: error.message
    });
  }
};

// Get student's ranking details
exports.getStudentRanking = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId)
      .select('name totalScore badges rank totalQuizzesTaken averageScore highestScore quizScores');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get total number of students
    const totalStudents = await Student.countDocuments();

    // Get recent quiz performances
    const recentQuizzes = student.quizScores
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5);

    // Calculate performance trends
    const performanceTrend = calculatePerformanceTrend(student.quizScores);

    res.status(200).json({
      success: true,
      message: 'Student ranking details retrieved successfully',
      data: {
        student: {
          name: student.name,
          totalScore: student.totalScore,
          rank: student.rank,
          totalStudents,
          badges: student.badges,
          totalQuizzesTaken: student.totalQuizzesTaken,
          averageScore: student.averageScore,
          highestScore: student.highestScore
        },
        recentQuizzes,
        performanceTrend
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student ranking',
      error: error.message
    });
  }
};

// Get top performers
exports.getTopPerformers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topPerformers = await Student.find()
      .select('name totalScore badges rank')
      .sort({ totalScore: -1, averageScore: -1 })
      .limit(parseInt(limit));

    const formattedTopPerformers = topPerformers.map((student, index) => ({
      rank: index + 1,
      studentName: student.name,
      score: student.totalScore,
      badges: student.badges
    }));

    res.status(200).json({
      success: true,
      message: 'Top performers retrieved successfully',
      data: {
        topPerformers: formattedTopPerformers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top performers',
      error: error.message
    });
  }
};

// Get ranking statistics
exports.getRankingStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ totalQuizzesTaken: { $gt: 0 } });
    
    const averageScore = await Student.aggregate([
      { $match: { totalQuizzesTaken: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
    ]);

    const scoreDistribution = await Student.aggregate([
      { $match: { totalScore: { $gt: 0 } } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$totalScore', 100] }, then: '0-100' },
                { case: { $lt: ['$totalScore', 500] }, then: '100-500' },
                { case: { $lt: ['$totalScore', 1000] }, then: '500-1000' },
                { case: { $lt: ['$totalScore', 2000] }, then: '1000-2000' }
              ],
              default: '2000+'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Ranking statistics retrieved successfully',
      data: {
        totalStudents,
        activeStudents,
        averageScore: averageScore.length > 0 ? Math.round(averageScore[0].avgScore) : 0,
        scoreDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ranking statistics',
      error: error.message
    });
  }
};

// Helper function to assign badges based on performance
async function assignBadges(student) {
  const badges = new Set(student.badges);

  // Get all students for ranking calculations
  const allStudents = await Student.find().sort({ totalScore: -1 });
  const studentRank = allStudents.findIndex(s => s._id.toString() === student._id.toString()) + 1;

  // Perfect Score badge
  if (student.highestScore >= 100) {
    badges.add('Perfect Score');
  }

  // Top Scorer badge (highest total score)
  if (studentRank === 1) {
    badges.add('Top Scorer');
    badges.add('First Place');
  }

  // Top 10 badge
  if (studentRank <= 10) {
    badges.add('Top 10');
  }

  // Top 25 badge
  if (studentRank <= 25) {
    badges.add('Top 25');
  }

  // Consistent Performer (average score > 80%)
  if (student.averageScore >= 80) {
    badges.add('Consistent Performer');
  }

  // Quiz Master (taken many quizzes)
  if (student.totalQuizzesTaken >= 10) {
    badges.add('Quiz Master');
  }

  // Knowledge Seeker (taken at least 5 quizzes)
  if (student.totalQuizzesTaken >= 5) {
    badges.add('Knowledge Seeker');
  }

  // Rising Star (recent improvement)
  if (student.quizScores.length >= 3) {
    const recentScores = student.quizScores
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 3);
    
    const isImproving = recentScores.every((score, index) => {
      if (index === 0) return true;
      return score.percentage >= recentScores[index - 1].percentage;
    });

    if (isImproving) {
      badges.add('Rising Star');
    }
  }

  student.badges = Array.from(badges);
}

// Helper function to update all students' ranks
async function updateAllRanks() {
  const students = await Student.find().sort({ totalScore: -1, averageScore: -1 });
  
  for (let i = 0; i < students.length; i++) {
    students[i].rank = i + 1;
    await students[i].save();
  }
}

// Helper function to calculate performance trend
function calculatePerformanceTrend(quizScores) {
  if (quizScores.length < 2) {
    return { trend: 'stable', message: 'Need more quizzes to determine trend' };
  }

  const recentScores = quizScores
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5);

  const percentages = recentScores.map(quiz => quiz.percentage);
  
  // Calculate trend
  let improving = 0;
  let declining = 0;
  
  for (let i = 1; i < percentages.length; i++) {
    if (percentages[i] > percentages[i - 1]) {
      improving++;
    } else if (percentages[i] < percentages[i - 1]) {
      declining++;
    }
  }

  if (improving > declining) {
    return { trend: 'improving', message: 'Your performance is improving!' };
  } else if (declining > improving) {
    return { trend: 'declining', message: 'Consider reviewing your study strategy' };
  } else {
    return { trend: 'stable', message: 'Your performance is consistent' };
  }
}

