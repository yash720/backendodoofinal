const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({quiet: true});
const colors = require('colors');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Odoo Finals API - Basic Test',
    status: 'Server is running successfully!'
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

app.get('/test/:id', (req, res) => {
  res.json({ message: 'Parameter route working', id: req.params.id });
});

app.use('/api/auth', require('./routes/auth'));

connectDB();

const PORT = process.env.PORT || 5700;
app.listen(PORT, () => {
    console.log(`Simple Server is running: http://localhost:${PORT}`.cyan.underline);
    console.log('Testing basic routes only...'.yellow);
});

module.exports = app;
