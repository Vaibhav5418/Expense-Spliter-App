const express = require('express');
const router = express.Router();
const { predictCategory } = require('../controllers/expenseController');
const auth = require('../middlewares/authMiddleware');

router.use(auth); // Protect all routes

router.post('/predict', predictCategory);

module.exports = router;
