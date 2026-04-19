const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
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

// Database Sync & Initialization
const init = async () => {
    try {
        await connectDB();
        require('./models');
        await sequelize.sync();
        console.log('Database tables synced.');
    } catch (err) {
        console.error('Database initialization failed:', err);
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
    // In Vercel, we just need to ensure DB is connected on first request or similar
    // Sequelize handles connection pooling, so as long as models are defined, 
    // the first query will trigger the connection.
    require('./models');
}

// Export for Vercel Serverless
module.exports = app;
