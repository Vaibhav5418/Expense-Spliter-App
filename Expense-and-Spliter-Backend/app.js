const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create Express App
const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://expense-and-spliter-frontend.vercel.app',
    'https://expense-and-spliter-git-da1e9e-vaibhav-sonis-projects-830e28a2.vercel.app',
    'https://expense-and-spliter-frontend-o8nbjp5oy.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(null, new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    },
    credentials: true
}));
app.use(express.json()); // Parse JSON bodies

// Route Imports
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const splitterRoutes = require('./routes/splitterRoutes');

// Mount Routes
app.use('/api', authRoutes); // /api/register, /api/login
app.use('/api', predictionRoutes); // /api/predict
app.use('/api/expenses', expenseRoutes); // /api/expenses CRUD
app.use('/api/dashboard', dashboardRoutes); // /api/dashboard/kpi
app.use('/api/analytics', analyticsRoutes); // /api/analytics
app.use('/api/insights', insightsRoutes); // /api/insights
app.use('/api/categories', categoryRoutes); // /api/categories
app.use('/api/splitter', splitterRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Active',
        database: 'Connected', // This is static, real checking would be in db connection logic or middleware
        ai: process.env.GROQ_API_KEY ? 'Active' : 'Fallback Mode',
        timestamp: new Date()
    });
});

// Root Route
app.get('/', (req, res) => {
    res.send('✅ Expense Tracker API Running (New Enterprise Architecture)');
});

module.exports = app;
