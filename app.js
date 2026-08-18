const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({quiet: true});
const colors = require('colors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);



connectDB();

// Auth routes (public)
app.use('/api/auth', require('./routes/auth'));

// Protected routes
app.use('/api/student', require('./routes/student'));
app.use('/api/company', require('./routes/company'));
app.use('/api/tpo', require('./routes/tpo'));

// Question and Test routes
app.use('/api/questions', require('./routes/questions'));
app.use('/api/tests', require('./routes/tests'));

// TPO Job Approval routes
app.use('/api/tpo/job-approval', require('./routes/tpoJobApproval'));

// Ranking and Leaderboard routes
app.use('/api/ranking', require('./routes/ranking'));

// Timeline and Notifications routes
app.use('/api/timeline', require('./routes/timeline'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Odoo Finals API',
    status: 'Server is running successfully!',
          endpoints: {
        auth: '/api/auth',
        student: '/api/student',
        company: '/api/company',
        tpo: '/api/tpo',
        questions: '/api/questions',
        tests: '/api/tests',
        tpoJobApproval: '/api/tpo/job-approval',
        ranking: '/api/ranking',
        timeline: '/api/timeline'
      }
  });
});

// 404 handler - using a more specific pattern
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});
app.get('/*',(req,res)=>{
  return res.json("route not avaliable please go back to proper routes")
})
const PORT = process.env.PORT || 5700;
app.listen(PORT, () => {
    console.log(`Server is running: http://localhost:${PORT}`.cyan.underline);
});

module.exports = app;