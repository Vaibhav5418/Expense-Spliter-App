const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Payer
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Receiver
    amount: { type: Number, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },

    status: {
        type: String,
        enum: ['PENDING', 'SETTLED', 'REJECTED'],
        default: 'PENDING'
    },

    settledAt: { type: Date },
    settledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who marked it as settled
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Settlement', settlementSchema);
