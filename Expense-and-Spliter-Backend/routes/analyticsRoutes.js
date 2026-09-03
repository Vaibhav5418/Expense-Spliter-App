const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const auth = require('../middlewares/authMiddleware');

router.use(auth); // Protect all routes

router.get('/', getAnalytics);

module.exports = router;
