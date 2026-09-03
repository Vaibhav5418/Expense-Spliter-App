const mongoose = require('mongoose');
const Expense = require('../models/Expense');

const getInsights = async (req, res) => {
    try {
        const userId = req.userId;
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const expensesCurrent = await Expense.find({
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: firstDayCurrentMonth }
        });

        const expensesLast = await Expense.find({
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: firstDayLastMonth, $lte: lastDayLastMonth }
        });

        const totalCurrent = expensesCurrent.reduce((acc, curr) => acc + curr.amount, 0);
        const totalLast = expensesLast.reduce((acc, curr) => acc + curr.amount, 0);

        const changePercent = totalLast === 0 ? 0 : ((totalCurrent - totalLast) / totalLast) * 100;
        const savingsAmount = Math.max(0, totalLast - totalCurrent);

        // Category dominance
        const catTotals = {};
        expensesCurrent.forEach(exp => {
            catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount;
        });
        let topCategory = 'N/A';
        let topCategoryAmount = 0;
        for (const [cat, amt] of Object.entries(catTotals)) {
            if (amt > topCategoryAmount) {
                topCategory = cat;
                topCategoryAmount = amt;
            }
        }

        // Weekday Spending
        const weekdayTotals = Array(7).fill(0);
        expensesCurrent.forEach(exp => {
            const day = new Date(exp.date).getDay();
            weekdayTotals[day] += exp.amount;
        });
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const highestSpendingDay = weekdayTotals.some(t => t > 0) ? days[weekdayTotals.indexOf(Math.max(...weekdayTotals))] : 'N/A';

        // Avg Daily Spending
        const daysPassed = now.getDate();
        const avgDailySpend = totalCurrent / Math.max(1, daysPassed);

        res.json({
            monthComparison: {
                current: totalCurrent,
                last: totalLast,
                percent: changePercent
            },
            topCategory,
            topCategoryAmount,
            highestSpendingDay,
            savingsAmount,
            avgDailySpend
        });
    } catch (err) {
        console.error('Insights Error:', err);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
};

module.exports = { getInsights };
