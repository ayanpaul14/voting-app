const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');
require('dotenv').config();

// --- UPDATED CORS SETTINGS ---
const allowedOrigins = [
    'https://voting-app-azure-gamma.vercel.app',
    'http://localhost:5173',
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // Check if the origin is in our list OR if it's a Vercel preview URL
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Crucial for sending JWT tokens in headers
}));
// -----------------------------

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