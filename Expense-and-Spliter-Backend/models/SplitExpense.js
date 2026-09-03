const mongoose = require('mongoose');

const splitExpenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    splitType: {
        type: String,
        enum: ['EQUAL', 'PERCENTAGE', 'EXACT', 'SHARES'],
        default: 'EQUAL'
    },

    // Detailed breakdown of who owes what
    splits: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number, required: true },
        percentage: { type: Number }, // Optional, for percentage splits
        shares: { type: Number } // Optional, for share-based splits
    }],

    // Legacy field for backward compatibility
    splitBreakdown: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number, required: true },
        percentage: { type: Number },
        shares: { type: Number }
    }],

    category: { type: String, default: 'Others' },
    billImage: { type: String }, // Backwards compatibility for single image
    images: [{ type: String }], // Array of receipts
    date: { type: Date, default: Date.now },
    notes: { type: String },



    // Audit History
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    editHistory: [{
        previousAmount: { type: Number },
        previousSplit: { type: mongoose.Schema.Types.Mixed }, // Store snapshot of breakdown
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('SplitExpense', splitExpenseSchema);
