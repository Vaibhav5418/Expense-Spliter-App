const express = require('express');
const router = express.Router();
const { getDashboardKPI } = require('../controllers/dashboardController');
const auth = require('../middlewares/authMiddleware');

router.use(auth); // Protect all routes

router.get('/kpi', getDashboardKPI);

module.exports = router;
