const Category = require('../models/Category');

const getCategories = async (req, res) => {
    try {
        const customCategories = await Category.find({ userId: req.userId });
        res.json(customCategories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const existing = await Category.findOne({ userId: req.userId, name });
        if (existing) return res.status(400).json({ error: 'Category already exists' });

        const category = new Category({ userId: req.userId, name });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add category' });
    }
};

module.exports = { getCategories, addCategory };
