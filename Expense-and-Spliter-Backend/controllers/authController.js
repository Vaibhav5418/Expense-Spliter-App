const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { username, email, password, name } = req.body;

        if (await User.findOne({ $or: [{ username }, { email }] })) {
            return res.status(400).json({ error: 'Username or Email already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashed,
            name: name || username
        });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be username or email
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) return res.status(400).json({ error: 'Authentication failed' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Authentication failed' });

        const displayName = (user.name && user.name !== 'Operative') ? user.name : user.username;
        const JWT_SECRET = process.env.JWT_SECRET || 'finpulse_jwt_secure_secret_key_2026';
        const token = jwt.sign(
            { userId: user._id, username: user.username, name: displayName, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                name: displayName,
                avatar: user.avatar || ''
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userObj = user.toObject();
        userObj.name = (userObj.name && userObj.name !== 'Operative') ? userObj.name : userObj.username;
        res.json(userObj);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

module.exports = { register, login, getProfile };
