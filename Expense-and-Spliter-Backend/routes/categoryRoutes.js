const express = require('express');
const router = express.Router();
const { getCategories, addCategory } = require('../controllers/categoryController');
const auth = require('../middlewares/authMiddleware');

router.use(auth); // Protect all routes

router.get('/', getCategories);
router.post('/', addCategory);

module.exports = router;
