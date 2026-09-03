const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    invitedEmails: [{ type: String }], // Emails of people invited but not yet joined
    currency: { type: String, default: 'INR' },
    avatar: { type: String }, // URL or color code
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
