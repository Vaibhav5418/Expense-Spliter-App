const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
        type: String,
        required: true,
        enum: [
            'EXPENSE_ADDED',
            'EXPENSE_EDITED',
            'EXPENSE_UPDATED',
            'EXPENSE_DELETED',
            'SETTLEMENT_RECORDED',
            'MEMBER_JOINED',
            'MEMBER_INVITED',
            'COMMENT_ADDED'
        ]
    },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // Expense ID, Settlement ID, etc.
    metadata: { type: Object }, // Store names, amounts, etc. for quick read
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
