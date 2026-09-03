const mongoose = require('mongoose');

// User correction mapping schema
const correctionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    correctedCategory: String
});

const Correction = mongoose.model('Correction', correctionSchema);

module.exports = Correction;
