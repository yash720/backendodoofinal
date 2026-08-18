const QuestionSet = require('../models/QuestionSet');
const Question = require('../models/Question');
const StudentAnswer = require('../models/StudentAnswer');
const Student = require('../models/Student');

exports.startTest = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    const studentId = req.user.id;

    const questionSet = await QuestionSet.findById(questionSetId)
      .populate('questions')
      .populate('createdBy', 'name');

    if (!questionSet || !questionSet.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Question set not found or inactive'
      });
    }

    const existingTest = await StudentAnswer.findOne({
      student: studentId,
      questionSet: questionSetId,
      isCompleted: false
    });

    if (existingTest) {
      return res.status(400).json({
        success: false,
        message: 'You have already started this test',
        data: existingTest
      });
    }

    const testSession = new StudentAnswer({
      student: studentId,
      questionSet: questionSetId,
      totalMarksPossible: questionSet.maximumMarks,
      startTime: new Date(),
      answers: questionSet.questions.map(question => ({
        question: question._id,
        selectedAnswer: null,
        isCorrect: false,
        marksObtained: 0
      }))
    });

    await testSession.save();

    const questionsForTest = questionSet.questions.map(question => ({
      _id: question._id,
      questionText: question.questionText,
      options: question.options,
      marks: question.marks
    }));

    res.status(200).json({
      success: true,
      message: 'Test started successfully',
      data: {
        testSession: testSession._id,
        questionSet: {
          title: questionSet.title,
          description: questionSet.description,
          timeLimit: questionSet.timeLimit,
          totalQuestions: questionSet.totalQuestions,
          maximumMarks: questionSet.maximumMarks
        },
        questions: questionsForTest,
        startTime: testSession.startTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting test',
      error: error.message
    });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { testSessionId, questionId } = req.params;
    const { selectedAnswer } = req.body;
    const studentId = req.user.id;

    if (!['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answer format'
      });
    }

    const testSession = await StudentAnswer.findOne({
      _id: testSessionId,
      student: studentId,
      isCompleted: false
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found or already completed'
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const answerIndex = testSession.answers.findIndex(
      answer => answer.question.toString() === questionId
    );

    if (answerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this test'
      });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;
    const marksObtained = isCorrect ? question.marks : 0;

    testSession.answers[answerIndex] = {
      question: questionId,
      selectedAnswer,
      isCorrect,
      marksObtained,
      timeTaken: Date.now() - testSession.startTime.getTime()
    };

    testSession.totalMarksObtained = testSession.answers.reduce(
      (total, answer) => total + answer.marksObtained, 0
    );

    await testSession.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        isCorrect,
        marksObtained,
        correctAnswer: question.correctAnswer
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting answer',
      error: error.message
    });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { testSessionId } = req.params;
    const studentId = req.user.id;

    const testSession = await StudentAnswer.findOne({
      _id: testSessionId,
      student: studentId,
      isCompleted: false
    });

    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found or already completed'
      });
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - testSession.startTime.getTime()) / (1000 * 60);

    testSession.endTime = endTime;
    testSession.duration = duration;
    testSession.isCompleted = true;
    testSession.isSubmitted = true;

    await testSession.save();

    try {
      const Student = require('../models/Student');
      const student = await Student.findById(studentId);

      if (student) {

        student.quizScores.push({
          quizId: testSession.questionSet,
          score: testSession.totalMarksObtained,
          percentage: testSession.percentage,
          completedAt: new Date()
        });

        student.totalScore = student.quizScores.reduce((total, quiz) => total + quiz.score, 0);

        student.totalQuizzesTaken = student.quizScores.length;

        student.averageScore = student.totalScore / student.totalQuizzesTaken;

        student.highestScore = Math.max(student.highestScore, testSession.totalMarksObtained);

        await student.save();
      }
    } catch (error) {
      console.log('Error updating student score:', error);
    }

    const detailedResults = await StudentAnswer.findById(testSessionId)
      .populate('questionSet', 'title description maximumMarks')
      .populate({
        path: 'answers.question',
        select: 'questionText options correctAnswer marks explanation category difficulty'
      });

    const totalQuestions = testSession.answers.length;
    const correctAnswers = testSession.answers.filter(answer => answer.isCorrect).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const totalScore = testSession.totalMarksObtained;
    const totalPossible = testSession.totalMarksPossible;
    const percentage = testSession.percentage;

    const subjectPerformance = {};
    testSession.answers.forEach(answer => {
      const category = answer.question.category || 'General';
      if (!subjectPerformance[category]) {
        subjectPerformance[category] = {
          correct: 0,
          incorrect: 0,
          total: 0,
          score: 0,
          totalMarks: 0
        };
      }

      subjectPerformance[category].total++;
      subjectPerformance[category].totalMarks += answer.question.marks;

      if (answer.isCorrect) {
        subjectPerformance[category].correct++;
        subjectPerformance[category].score += answer.marksObtained;
      } else {
        subjectPerformance[category].incorrect++;
      }
    });

    const subjectWiseData = Object.keys(subjectPerformance).map(subject => {
      const data = subjectPerformance[subject];
      return {
        section: subject,
        correct: data.correct,
        incorrect: data.incorrect,
        total: data.total,
        score: data.score,
        totalMarks: data.totalMarks,
        scorePercentage: data.totalMarks > 0 ? Math.round((data.score / data.totalMarks) * 100) : 0
      };
    });

    const questionAnalysis = testSession.answers.map(answer => ({
      questionId: answer.question._id,
      questionText: answer.question.questionText,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: answer.question.correctAnswer,
      isCorrect: answer.isCorrect,
      marksObtained: answer.marksObtained,
      totalMarks: answer.question.marks,
      category: answer.question.category || 'General',
      difficulty: answer.question.difficulty,
      explanation: answer.question.explanation,
      timeTaken: answer.timeTaken
    }));

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {

        performanceSummary: {
          totalScore: {
            value: percentage.toFixed(1),
            unit: '%',
            label: 'Total Score',
            color: percentage >= 80 ? 'green' : percentage >= 60 ? 'blue' : 'red'
          },
          correctAnswers: {
            value: `${correctAnswers}/${totalQuestions}`,
            label: 'Correct Answers',
            color: 'blue'
          },
          wrongAnswers: {
            value: wrongAnswers.toString(),
            label: 'Wrong Answers',
            color: 'red'
          }
        },

        subjectWisePerformance: {
          title: 'Subject-wise Performance',
          data: subjectWiseData
        },

        statistics: {
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          totalScore,
          totalPossible,
          percentage: percentage.toFixed(1),
          duration: testSession.duration,
          averageTimePerQuestion: testSession.duration / totalQuestions
        },

        questionAnalysis,

        testDetails: {
          questionSet: detailedResults.questionSet,
          startTime: testSession.startTime,
          endTime: testSession.endTime,
          duration: testSession.duration
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting test',
      error: error.message
    });
  }
};

exports.getTestResults = async (req, res) => {
  try {
    const { testSessionId } = req.params;
    const studentId = req.user.id;

    const testResult = await StudentAnswer.findOne({
      _id: testSessionId,
      student: studentId,
      isCompleted: true
    })
    .populate('questionSet', 'title description maximumMarks')
    .populate({
      path: 'answers.question',
      select: 'questionText options correctAnswer marks explanation category difficulty'
    });

    if (!testResult) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    const totalQuestions = testResult.answers.length;
    const correctAnswers = testResult.answers.filter(answer => answer.isCorrect).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const totalScore = testResult.totalMarksObtained;
    const totalPossible = testResult.totalMarksPossible;
    const percentage = testResult.percentage;

    const subjectPerformance = {};
    testResult.answers.forEach(answer => {
      const category = answer.question.category || 'General';
      if (!subjectPerformance[category]) {
        subjectPerformance[category] = {
          correct: 0,
          incorrect: 0,
          total: 0,
          score: 0,
          totalMarks: 0
        };
      }

      subjectPerformance[category].total++;
      subjectPerformance[category].totalMarks += answer.question.marks;

      if (answer.isCorrect) {
        subjectPerformance[category].correct++;
        subjectPerformance[category].score += answer.marksObtained;
      } else {
        subjectPerformance[category].incorrect++;
      }
    });

    const subjectWiseData = Object.keys(subjectPerformance).map(subject => {
      const data = subjectPerformance[subject];
      return {
        section: subject,
        correct: data.correct,
        incorrect: data.incorrect,
        total: data.total,
        score: data.score,
        totalMarks: data.totalMarks,
        scorePercentage: data.totalMarks > 0 ? Math.round((data.score / data.totalMarks) * 100) : 0
      };
    });

    const questionAnalysis = testResult.answers.map(answer => ({
      questionId: answer.question._id,
      questionText: answer.question.questionText,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: answer.question.correctAnswer,
      isCorrect: answer.isCorrect,
      marksObtained: answer.marksObtained,
      totalMarks: answer.question.marks,
      category: answer.question.category || 'General',
      difficulty: answer.question.difficulty,
      explanation: answer.question.explanation,
      timeTaken: answer.timeTaken
    }));

    res.status(200).json({
      success: true,
      message: 'Test results retrieved successfully',
      data: {

        performanceSummary: {
          totalScore: {
            value: percentage.toFixed(1),
            unit: '%',
            label: 'Total Score',
            color: percentage >= 80 ? 'green' : percentage >= 60 ? 'blue' : 'red'
          },
          correctAnswers: {
            value: `${correctAnswers}/${totalQuestions}`,
            label: 'Correct Answers',
            color: 'blue'
          },
          wrongAnswers: {
            value: wrongAnswers.toString(),
            label: 'Wrong Answers',
            color: 'red'
          }
        },

        subjectWisePerformance: {
          title: 'Subject-wise Performance',
          data: subjectWiseData
        },

        statistics: {
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          totalScore,
          totalPossible,
          percentage: percentage.toFixed(1),
          duration: testResult.duration,
          averageTimePerQuestion: testResult.duration / totalQuestions
        },

        questionAnalysis,

        testDetails: {
          questionSet: testResult.questionSet,
          startTime: testResult.startTime,
          endTime: testResult.endTime,
          duration: testResult.duration
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test results',
      error: error.message
    });
  }
};

exports.getAllTestResults = async (req, res) => {
  try {
    const studentId = req.user.id;

    const testResults = await StudentAnswer.find({
      student: studentId,
      isCompleted: true
    })
    .populate('questionSet', 'title description maximumMarks')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: testResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test results',
      error: error.message
    });
  }
};

exports.getTestAnalytics = async (req, res) => {
  try {
    const { questionSetId } = req.params;
    const tpoId = req.user.id;

    const questionSet = await QuestionSet.findOne({
      _id: questionSetId,
      createdBy: tpoId
    });

    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: 'Question set not found'
      });
    }

    const testResults = await StudentAnswer.find({
      questionSet: questionSetId,
      isCompleted: true
    })
    .populate('student', 'name email rollNumber')
    .populate({
      path: 'answers.question',
      select: 'questionText correctAnswer'
    });

    const totalStudents = testResults.length;
    const averageScore = totalStudents > 0
      ? testResults.reduce((sum, result) => sum + result.percentage, 0) / totalStudents
      : 0;

    const questionAnalytics = {};
    if (testResults.length > 0) {
      const firstTest = testResults[0];
      firstTest.answers.forEach(answer => {
        const questionId = answer.question._id.toString();
        const correctCount = testResults.filter(test =>
          test.answers.find(a =>
            a.question._id.toString() === questionId && a.isCorrect
          )
        ).length;

        questionAnalytics[questionId] = {
          questionText: answer.question.questionText,
          correctAnswers: correctCount,
          totalAttempts: totalStudents,
          successRate: (correctCount / totalStudents) * 100
        };
      });
    }

    res.status(200).json({
      success: true,
      data: {
        questionSet: {
          title: questionSet.title,
          description: questionSet.description,
          maximumMarks: questionSet.maximumMarks
        },
        analytics: {
          totalStudents,
          averageScore,
          questionAnalytics
        },
        detailedResults: testResults
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test analytics',
      error: error.message
    });
  }
};
