const mongoose = require('mongoose');
const Expense = require('../models/Expense');

const getAnalytics = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Sector Diversification (Category Pie Chart)
        const categoryStats = await Expense.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } }
        ]);

        // 2. Asset Allocation (Payment Mode Doughnut Chart)
        const paymentModeStats = await Expense.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$paymentMode", total: { $sum: "$amount" } } }
        ]);

        // 3. Capital Trend (Daily Line Chart - Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Sort logic to ensure correct daily order
        const trendStats = await Expense.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            sectorDiversification: categoryStats,
            assetAllocation: paymentModeStats,
            capitalTrend: trendStats
        });

    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
};

module.exports = { getAnalytics };
