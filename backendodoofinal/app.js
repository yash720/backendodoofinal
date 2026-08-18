const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({quiet: true});
const colors = require('colors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

connectDB();

app.use('/', require('./routes/views'));

app.use('/api/auth', require('./routes/auth'));

app.use('/api/student', require('./routes/student'));
app.use('/api/company', require('./routes/company'));
app.use('/api/tpo', require('./routes/tpo'));

app.use('/api/questions', require('./routes/questions'));
app.use('/api/tests', require('./routes/tests'));

app.use('/api/tpo/job-approval', require('./routes/tpoJobApproval'));

app.use('/api/ranking', require('./routes/ranking'));

app.use('/api/timeline', require('./routes/timeline'));

app.get('/api-info', (req, res) => {
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