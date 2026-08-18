
const sampleQuestionSet = {
  title: "JavaScript Fundamentals Test",
  description: "A comprehensive test covering JavaScript basics, ES6 features, and DOM manipulation",
  maximumMarks: 50,
  marksPerQuestion: 5,
  totalQuestions: 10,
  timeLimit: 60, // 60 minutes
  isActive: true
};

const sampleQuestions = [
  {
    questionText: "What is the output of console.log(typeof null)?",
    options: {
      A: "null",
      B: "object",
      C: "undefined",
      D: "number"
    },
    correctAnswer: "B",
    marks: 5,
    explanation: "In JavaScript, typeof null returns 'object'. This is a known bug in JavaScript that has persisted for historical reasons.",
    difficulty: "medium",
    category: "JavaScript Basics"
  },
  {
    questionText: "Which method is used to add an element at the end of an array?",
    options: {
      A: "push()",
      B: "pop()",
      C: "shift()",
      D: "unshift()"
    },
    correctAnswer: "A",
    marks: 5,
    explanation: "The push() method adds one or more elements to the end of an array and returns the new length of the array.",
    difficulty: "easy",
    category: "Array Methods"
  },
  {
    questionText: "What does the 'let' keyword do in JavaScript?",
    options: {
      A: "Declares a constant variable",
      B: "Declares a block-scoped variable",
      C: "Declares a function-scoped variable",
      D: "Declares a global variable"
    },
    correctAnswer: "B",
    marks: 5,
    explanation: "The 'let' keyword declares a block-scoped variable, which means it's only accessible within the block it's declared in.",
    difficulty: "easy",
    category: "ES6 Features"
  },
  {
    questionText: "What is the purpose of the 'use strict' directive?",
    options: {
      A: "To enable strict mode for better error checking",
      B: "To disable all JavaScript features",
      C: "To make code run faster",
      D: "To enable experimental features"
    },
    correctAnswer: "A",
    marks: 5,
    explanation: "The 'use strict' directive enables strict mode, which helps catch common coding mistakes and prevents certain actions.",
    difficulty: "medium",
    category: "JavaScript Basics"
  },
  {
    questionText: "Which method is used to convert a string to an integer?",
    options: {
      A: "parseInt()",
      B: "parseFloat()",
      C: "toString()",
      D: "toFixed()"
    },
    correctAnswer: "A",
    marks: 5,
    explanation: "parseInt() is used to convert a string to an integer. It parses a string and returns an integer.",
    difficulty: "easy",
    category: "Type Conversion"
  }
];



module.exports = {
  sampleQuestionSet,
  sampleQuestions
};

