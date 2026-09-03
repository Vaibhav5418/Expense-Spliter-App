const express = require('express');
const router = express.Router();
const { getInsights } = require('../controllers/insightsController');
const auth = require('../middlewares/authMiddleware');

router.use(auth); // Protect all routes

router.get('/', getInsights);

module.exports = router;
