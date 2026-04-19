const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
require('pg'); // Force inclusion for Vercel bundler
const { connectDB, sequelize } = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/nfts', require('./routes/nftRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));

// Default Route
app.get('/', (req, res) => {
    res.send('GreenVerse API is running...');
});

const PORT = process.env.PORT || 5001;

// Database Sync & Initialization (Centralized)
const init = async () => {
    try {
        console.log('Initializing database synchronization...');
        await connectDB();
        require('./models');
        await sequelize.sync();
        console.log('Database tables ready.');
    } catch (err) {
        console.error('Database initialization error:', err.message);
    }
};

// Handle serverless vs local environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    init().then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running locally on http://0.0.0.0:${PORT}`);
        });
    });
} else {
    // In Vercel, we call init() but don't block the export.
    // This allows Vercel to boot the function immediately while DB connects.
    init();
}

// Export for Vercel Serverless
module.exports = app;
