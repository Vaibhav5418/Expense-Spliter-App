const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, default: '' },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
