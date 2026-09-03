const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    email: { type: String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    token: { type: String, required: true }, // Unique token for the invite link

    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'EXPIRED'],
        default: 'PENDING'
    },

    expiresAt: { type: Date, required: true }
}, { timestamps: true });

// Index for fast lookups
inviteSchema.index({ email: 1, groupId: 1 });
inviteSchema.index({ token: 1 });

module.exports = mongoose.model('Invite', inviteSchema);
