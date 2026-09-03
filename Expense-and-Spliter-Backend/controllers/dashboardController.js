const mongoose = require('mongoose');
const Expense = require('../models/Expense');

const getDashboardKPI = async (req, res) => {
    try {
        const userId = req.userId;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Aggregation for Total Expenses & Monthly Average
        const stats = await Expense.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: "$amount" },
                    count: { $sum: 1 },
                    minDate: { $min: "$date" },
                    maxDate: { $max: "$date" }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                totalExpenses: 0,
                avgMonthly: 0,
                dailyBurnRate: 0,
                transactionCount: 0
            });
        }

        const { totalExpenses, count, minDate, maxDate } = stats[0];

        // Calculate months difference for average (ensure non-zero division)
        const timeDiff = Math.abs(maxDate - minDate);
        const monthsDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30)) || 1;
        const avgMonthly = totalExpenses / monthsDiff;

        // Daily Burn Rate (Current Month)
        const currentMonthStats = await Expense.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const currentMonthTotal = currentMonthStats[0]?.total || 0;
        const daysPassed = now.getDate();
        const dailyBurnRate = currentMonthTotal / Math.max(1, daysPassed);

        res.json({
            totalExpenses,
            avgMonthly,
            dailyBurnRate,
            transactionCount: count
        });

    } catch (err) {
        console.error('Dashboard KPI Error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard KPI' });
    }
};

module.exports = { getDashboardKPI };
