const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');
require('dotenv').config();

app.use(cors({
    origin: 'https://voting-app-azure-gamma.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Import routes
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Mount routes
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

// Global 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});