const Groq = require('groq-sdk');
const Correction = require('../models/Correction');
const KEYWORD_MAP = require('../utils/sectorKeywords');
require('dotenv').config();

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const getAICategory = async (title, userId) => {
    // 1. Check user corrections / learned mappings
    const correction = await Correction.findOne({ userId, title: title.toLowerCase().trim() });
    if (correction) {
        return { category: correction.correctedCategory, confidence: 1, method: 'Learning' };
    }

    // 2. Try Groq AI
    if (groq) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [{
                    role: "system",
                    content: `You are an expert financial auditor. Classify the expense title into exactly ONE of these categories:
Food, Travel, Shopping, Bills, Entertainment, Health, Investment, Others.

Rules:
- Food: Restaurants, groceries, Swiggy, Zomato, cafes, snacks.
- Travel: Uber, Ola, petrol, flights, trains, hotel stays, tolls.
- Shopping: Amazon, Flipkart, clothes, electronics, personal care.
- Bills: Electricity, rent, water, internet, mobile recharge, insurance.
- Entertainment: Movies, Netflix, gaming, parties, concerts.
- Health: Hospitals, medicine, gym, doctors.
- Investment: Stocks, mutual funds, gold, savings.
- Others: Anything that doesn't fit the above.

Respond in JSON format: {"category": "CategoryName", "confidence": 0.0-1.0}`
                }, {
                    role: "user",
                    content: title
                }],
                model: "llama3-8b-8192",
                response_format: { type: "json_object" }
            });

            const response = JSON.parse(completion.choices[0]?.message?.content || "{}");
            const validCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Investment', 'Others'];

            if (validCategories.includes(response.category)) {
                return {
                    category: response.category,
                    confidence: response.confidence || 0.8,
                    method: 'AI'
                };
            }
        } catch (err) {
            console.error('⚠️ Groq AI Error (Falling back to keywords):', err.message);
        }
    }

    // 3. Fallback to Keyword Map
    const lowerTitle = title.toLowerCase();
    for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
        if (keywords.some(keyword => lowerTitle.includes(keyword))) {
            return { category, confidence: 0.5, method: 'Heuristic' };
        }
    }

    return { category: 'Others', confidence: 0.1, method: 'Default' };
};

module.exports = getAICategory;
