const Expense = require('../models/Expense');
const Correction = require('../models/Correction');
const getAICategory = require('../services/aiCategorizer');

// 1. Add Expense
const addExpense = async (req, res) => {
    try {
        const { title, amount, date, category, paymentMode, isRecurring, recurringFrequency, recurringStartDate, recurringEndDate } = req.body;

        let finalCategory = category;
        let predicted = null;
        let isAI = false;
        let score = 0;

        // AI Categorization if no category provided
        if (!finalCategory) {
            const aiResult = await getAICategory(title, req.userId);
            finalCategory = aiResult.category;
            predicted = aiResult.category;
            score = aiResult.confidence;
            isAI = aiResult.method === 'AI';
        }

        const expense = new Expense({
            userId: req.userId,
            title,
            amount,
            date: date || new Date(),
            category: finalCategory || 'Others',
            paymentMode: paymentMode || 'Cash',
            isRecurring: isRecurring || false,
            recurringFrequency,
            recurringStartDate,
            recurringEndDate,
            isAIComputed: isAI,
            predictedCategory: predicted,
            aiConfidenceScore: score || 0,
            lastGeneratedDate: isRecurring ? (date || new Date()) : null
        });

        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add expense' });
    }
};

// 2. Get All Expenses (Filtered & Sorted)
const getExpenses = async (req, res) => {
    try {
        const { month, year, category, paymentMode, sort } = req.query;

        let query = { userId: req.userId };

        // Date Filtering
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            query.date = { $gte: startDate, $lte: endDate };
        }

        // Category & Mode Filtering
        if (category && category !== 'All') query.category = category;
        if (paymentMode && paymentMode !== 'All') query.paymentMode = paymentMode;

        // Sorting
        let sortOption = { date: -1 };
        if (sort === 'amount') sortOption = { amount: -1 };
        if (sort === 'oldest') sortOption = { date: 1 };

        const expenses = await Expense.find(query).sort(sortOption).lean();

        // Default fallback values for legacy data
        const formatted = expenses.map(e => ({
            ...e,
            category: e.category || 'Others',
            paymentMode: e.paymentMode || 'Cash'
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

// 3. Update Expense (Learns User Corrections)
const updateExpense = async (req, res) => {
    try {
        const { title, amount, date, category, paymentMode, isRecurring, recurringFrequency, recurringStartDate, recurringEndDate } = req.body;

        const oldExpense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
        if (!oldExpense) return res.status(404).json({ error: 'Expense not found' });

        // Learn from manual category override
        if (category && category !== oldExpense.category && oldExpense.isAIComputed) {
            await Correction.findOneAndUpdate(
                { userId: req.userId, title: oldExpense.title.toLowerCase() },
                { correctedCategory: category },
                { upsert: true }
            );
        }

        const updateData = { title, amount, date, category, paymentMode, isRecurring, recurringFrequency, recurringStartDate, recurringEndDate };
        if (category && category !== oldExpense.category) {
            updateData.isAIComputed = false;
        }

        const updated = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            updateData,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update expense' });
    }
};

// 4. Delete Expense
const deleteExpense = async (req, res) => {
    try {
        const deleted = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });
        if (!deleted) return res.status(404).json({ error: 'Expense not found' });
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};

// 5. Predict Category (Manual Trigger)
const predictCategory = async (req, res) => {
    try {
        const { title } = req.body;
        const result = await getAICategory(title || '', req.userId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Prediction failed' });
    }
};

module.exports = {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    predictCategory
};
