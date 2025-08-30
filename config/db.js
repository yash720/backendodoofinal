const mongoose = require('mongoose');
const colors = require('colors');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
        });
        console.log('MongoDB connected'.cyan.underline);
    } catch (err) {
        console.error(err.message.red.underline);
        process.exit(1);
    }
}
module.exports = connectDB;