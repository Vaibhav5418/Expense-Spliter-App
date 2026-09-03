const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const controller = require('../controllers/splitterController');

router.use(auth); // Protect all routes

// Groups
router.post('/groups', controller.createGroup);
router.get('/groups', controller.getGroups);
router.get('/groups/:id', controller.getGroupDetails);
router.delete('/groups/:id', controller.deleteGroup);
router.get('/analytics', controller.getSplitterAnalytics);

// Members
router.post('/groups/:id/invite', controller.inviteMember);

// Expenses
router.post('/groups/:id/expenses', controller.addSplitExpense);
router.put('/expenses/:id', controller.editSplitExpense); // New

// Settlements
router.post('/groups/:id/settlements', controller.createSettlement);

module.exports = router;
