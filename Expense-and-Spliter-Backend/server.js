const app = require('./app.js');
const connectDB = require('./config/db');
require('dotenv').config();
const initRecurringJobs = require('./jobs/recurringJobs');

// Connect to Database
connectDB();

// Init Recurring Jobs Scheduler
initRecurringJobs();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
