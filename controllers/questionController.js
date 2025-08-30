const Question = require('../models/Question');
const QuestionSet = require('../models/QuestionSet');
const StudentAnswer = require('../models/StudentAnswer');

// Create a new question set
exports.createQuestionSet = async (req, res) => {
  try {
    const { title, description, maximumMarks, marksPerQuestion, totalQuestions, timeLimit } = req.body;
    
    const questionSet = new QuestionSet({
      title,
      description,
      maximumMarks,
      marksPerQuestion,
      totalQuestions,
      timeLimit,
      createdBy: req.user.id // Assuming TPO is authenticated
    });

    await questionSet.save();
    
    res.status(201).json({
      success: true,
      message: 'Question set created successfully',
      data: questionSet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating question set',
      error: error.message
    });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { 
      questionText, 
      options, 
      correctAnswer, 
      marks, 
      explanation, 
      difficulty, 
      category,
      questionSetId 
    } = req.body;

    const question = new Question({
      questionText,
      options,
      correctAnswer,
      marks,
      explanation,
      difficulty,
      category,
      createdBy: req.user.id,
      questionSet: questionSetId
    });

    await question.save();

    // Add question to question set if provided
    if (questionSetId) {
      await QuestionSet.findByIdAndUpdate(
        questionSetId,
        { $push: { questions: question._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
};

// Get all question sets
exports.getAllQuestionSets = async (req, res) => {
  try {
    const questionSets = await QuestionSet.find({ isActive: true })
      .populate('createdBy', 'name email')
      .populate('questions', 'questionText difficulty category');

    res.status(200).json({
      success: true,
      data: questionSets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching question sets',
      error: error.message
    });
  }
};

// Get question set by ID with questions
exports.getQuestionSetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const questionSet = await QuestionSet.findById(id)
      .populate('createdBy', 'name email')
      .populate({
        path: 'questions',
        select: 'questionText options difficulty category marks'
      });

    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: 'Question set not found'
      });
    }

    res.status(200).json({
      success: true,
      data: questionSet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching question set',
      error: error.message
    });
  }
};

// Update question set
exports.updateQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const questionSet = await QuestionSet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: 'Question set not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question set updated successfully',
      data: questionSet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating question set',
      error: error.message
    });
  }
};

// Delete question set
exports.deleteQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;

    const questionSet = await QuestionSet.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: 'Question set not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question set deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question set',
      error: error.message
    });
  }
};

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('createdBy', 'name email')
      .populate('questionSet', 'title');

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const question = await Question.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Remove question from question set if it exists
    if (question.questionSet) {
      await QuestionSet.findByIdAndUpdate(
        question.questionSet,
        { $pull: { questions: id } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};
