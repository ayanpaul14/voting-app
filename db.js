const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL_LOCAL || process.env.MONGODB_URL;

mongoose.connect(mongoURL)
    .then(() => console.log('Connected to MongoDB server'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if DB connection fails
    });

const db = mongoose.connection;

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed on app termination');
    process.exit(0);
});

module.exports = mongoose;