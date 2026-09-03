const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.get('/me', auth, getProfile);

module.exports = router;
