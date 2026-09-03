const Group = require('../models/Group');
const SplitExpense = require('../models/SplitExpense');
const Settlement = require('../models/Settlement');
const Invite = require('../models/Invite');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog'); // New
const { sendInvitation } = require('../services/inviteService');
const { calculateSplit } = require('../services/splitLogicService');
const { simplifyDebts } = require('../services/debtSimplifier');
const { getGroupBalances } = require('../services/balanceService'); // New
const getAICategory = require('../services/aiCategorizer');

// --- Helpers ---
const logActivity = async (groupId, actorId, action, metadata, relatedId = null) => {
    try {
        await ActivityLog.create({ groupId, actorId, action, metadata, relatedId });
    } catch (e) {
        console.error('Failed to log activity', e);
    }
};

// --- Group Management ---

const createGroup = async (req, res) => {
    try {
        const { name, description, currency } = req.body;
        const newGroup = new Group({
            name,
            description,
            currency,
            createdBy: req.userId,
            members: [req.userId]
        });
        await newGroup.save();
        await logActivity(newGroup._id, req.userId, 'MEMBER_JOINED', { name: 'Admin' });
        res.status(201).json(newGroup);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create group' });
    }
};

const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.userId })
            .populate('members', 'name email avatar')
            .sort({ updatedAt: -1 });
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
};

const getGroupDetails = async (req, res) => {
    try {
        const group = await Group.findOne({ _id: req.params.id, members: req.userId })
            .populate('members', 'name email avatar');

        if (!group) return res.status(404).json({ error: 'Group not found' });

        const expenses = await SplitExpense.find({ groupId: group._id })
            .populate('paidBy', 'name email avatar')
            .populate('participants', 'name email avatar')
            .populate('splits.user', 'name email avatar')
            .populate('splitBreakdown.user', 'name email avatar')
            .sort({ date: -1 });

        const settlements = await Settlement.find({ groupId: group._id })
            .populate('fromUser', 'name')
            .populate('toUser', 'name')
            .sort({ settledAt: -1 });

        // Phase 2: Balances & Activity
        const balances = await getGroupBalances(group._id);
        const activities = await ActivityLog.find({ groupId: group._id })
            .populate('actorId', 'name')
            .sort({ createdAt: -1 })
            .limit(50); // Pagination later

        // Optimized Debts for Graph
        const simplifiedDebts = await simplifyDebts(group._id);

        res.json({
            group,
            expenses,
            settlements,
            simplifiedDebts,
            balances,
            activities
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch group details' });
    }
};

// --- Member Management ---

const inviteMember = async (req, res) => {
    try {
        const { email } = req.body;
        const groupId = req.params.id;

        const group = await Group.findOne({ _id: groupId, members: req.userId });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (group.members.includes(existingUser._id)) {
                return res.status(400).json({ error: 'User is already a member' });
            }
            group.members.push(existingUser._id);
            await group.save();
            await logActivity(groupId, req.userId, 'MEMBER_JOINED', { name: existingUser.name });
            return res.json({ message: 'User added to group', user: existingUser });
        }

        const sender = await User.findById(req.userId);
        const result = await sendInvitation(email, group.name, sender.name, groupId, req.userId);

        if (result.success) {
            if (!group.invitedEmails.includes(email)) {
                group.invitedEmails.push(email);
                await group.save();
                await logActivity(groupId, req.userId, 'MEMBER_INVITED', { email });
            }
            res.json({ message: 'Invitation sent' });
        } else {
            res.status(500).json({ error: 'Failed to send invitation' });
        }

    } catch (err) {
        res.status(500).json({ error: 'Invite failed' });
    }
};

// --- Expense Management ---

const addSplitExpense = async (req, res) => {
    try {
        const { title, amount, splitType, participants, splits, date, notes } = req.body;
        const groupId = req.params.id;

        const group = await Group.findOne({ _id: groupId, members: req.userId });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        let category = 'Others';
        try {
            const aiResult = await getAICategory(title, req.userId);
            category = aiResult.category;
        } catch (e) {
            console.warn('AI Category failed, using default');
        }

        let breakdown = [];
        try {
            breakdown = calculateSplit(amount, splitType, participants, splits);
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }

        const newExpense = new SplitExpense({
            title,
            amount,
            groupId,
            paidBy: req.userId,
            participants,
            splitType,
            splits: breakdown,
            category,
            date: date || new Date(),
            notes
        });

        await newExpense.save();

        // Populate before returning
        const populatedExpense = await SplitExpense.findById(newExpense._id)
            .populate('paidBy', 'name email avatar')
            .populate('splits.user', 'name email avatar')
            .populate('splitBreakdown.user', 'name email avatar');

        await logActivity(groupId, req.userId, 'EXPENSE_ADDED', {
            title,
            amount,
            currency: '₹'
        }, newExpense._id);

        res.status(201).json(populatedExpense);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add expense' });
    }
};



// --- Settlement Management ---

// --- Settlement Management ---

const createSettlement = async (req, res) => {
    try {
        const { toUserId, amount } = req.body;
        const groupId = req.params.id;

        // Verify Receiver Exists
        const toUser = await User.findById(toUserId);
        const fromUser = await User.findById(req.userId);

        const settlement = new Settlement({
            fromUser: req.userId,
            toUser: toUserId,
            amount,
            groupId,
            status: 'SETTLED',
            settledAt: new Date(),
            settledBy: req.userId
        });

        await settlement.save();

        await logActivity(groupId, req.userId, 'SETTLEMENT_RECORDED', {
            amount,
            toName: toUser.name,
            fromName: fromUser.name
        }, settlement._id);

        res.status(201).json(settlement);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to record settlement' });
    }
};

const editSplitExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, splitType, participants, splits, date, notes } = req.body;

        console.log(`[editSplitExpense] Processing update for ID: ${id}`);

        const expense = await SplitExpense.findById(id);
        if (!expense) {
            console.error(`[editSplitExpense] Expense ${id} not found`);
            return res.status(404).json({ error: 'Expense not found' });
        }

        const group = await Group.findById(expense.groupId);
        if (!group) {
            console.error(`[editSplitExpense] Group ${expense.groupId} for expense ${id} not found`);
            return res.status(404).json({ error: 'Group not found' });
        }

        // Permission Check: Only Creator or Admin
        if (expense.paidBy.toString() !== req.userId && group.createdBy.toString() !== req.userId) {
            console.error(`[editSplitExpense] Unauthorized edit attempt by ${req.userId}`);
            return res.status(403).json({ error: 'Not authorized to edit this expense' });
        }

        // Store history before update
        const historyEntry = {
            previousAmount: expense.amount,
            previousSplit: JSON.parse(JSON.stringify(expense.splits)), // Deep copy snapshot
            editedBy: req.userId,
            editedAt: new Date()
        };

        // Recalculate Split if any core split fields changed
        let breakdown = expense.splits;
        const isSplitChanged =
            amount !== expense.amount ||
            splitType !== expense.splitType ||
            participants?.length !== expense.participants.length ||
            (splits && splits.length > 0);

        if (isSplitChanged) {
            try {
                breakdown = calculateSplit(amount, splitType, participants, splits);
            } catch (e) {
                console.error(`[editSplitExpense] Split calculation error: ${e.message}`);
                return res.status(400).json({ error: e.message });
            }
        }

        // Update Fields
        expense.title = title || expense.title;
        expense.amount = amount;
        expense.participants = participants || expense.participants;
        expense.splitType = splitType || expense.splitType;
        expense.splits = breakdown;
        expense.date = date || expense.date;
        expense.notes = notes !== undefined ? notes : expense.notes;

        expense.edited = true;
        expense.editedAt = new Date();
        expense.editHistory.push(historyEntry);

        await expense.save();

        // Populate before returning
        const populatedExpense = await SplitExpense.findById(expense._id)
            .populate('paidBy', 'name email avatar')
            .populate('splits.user', 'name email avatar')
            .populate('splitBreakdown.user', 'name email avatar');

        // Log Activity
        await logActivity(expense.groupId, req.userId, 'EXPENSE_EDITED', {
            title: expense.title,
            amount: expense.amount,
            previousAmount: historyEntry.previousAmount
        }, expense._id);

        // Optional: Pre-trigger calculations if we had stateful analytics
        // await simplifyDebts(expense.groupId); 
        // await getGroupBalances(expense.groupId);

        console.log(`[editSplitExpense] Successfully updated expense: ${id}`);

        res.json({ message: 'Expense updated successfully', expense: populatedExpense });

    } catch (err) {
        console.error(`[editSplitExpense] Internal Error:`, err);
        res.status(500).json({ error: 'Failed to edit expense: ' + err.message });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find group and check membership
        const group = await Group.findOne({ _id: id, members: req.userId });
        if (!group) {
            return res.status(404).json({ error: 'Group not found or unauthorized' });
        }

        // 2. Delete related data
        await SplitExpense.deleteMany({ groupId: id });
        await Settlement.deleteMany({ groupId: id });
        await ActivityLog.deleteMany({ groupId: id });

        // 3. Delete group itself
        await Group.findByIdAndDelete(id);

        console.log(`[deleteGroup] Successfully deleted group and related data: ${id}`);
        res.json({ message: 'Group deleted successfully' });

    } catch (err) {
        console.error(`[deleteGroup] Internal Error:`, err);
        res.status(500).json({ error: 'Failed to delete group: ' + err.message });
    }
};

const getSplitterAnalytics = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Get all groups user is part of
        const groups = await Group.find({ members: userId });
        const groupIds = groups.map(g => g._id);

        // 2. Get all expenses for these groups
        const expenses = await SplitExpense.find({ groupId: { $in: groupIds } });

        // 3. Calculate user's share in each group
        const groupSpending = {};
        groups.forEach(g => {
            groupSpending[g._id.toString()] = {
                id: g._id,
                name: g.name,
                totalSpent: 0
            };
        });

        expenses.forEach(exp => {
            const gId = exp.groupId.toString();
            if (!groupSpending[gId]) return;

            // Use robust logic to find user's share
            const activeSplits = (exp.splits && exp.splits.length > 0) ? exp.splits : exp.splitBreakdown;
            if (activeSplits && activeSplits.length > 0) {
                const mySplit = activeSplits.find(s => s.user.toString() === userId);
                if (mySplit) {
                    groupSpending[gId].totalSpent += mySplit.amount;
                }
            } else {
                // Fallback for missing splits
                if (exp.participants && exp.participants.some(p => p.toString() === userId)) {
                    groupSpending[gId].totalSpent += (exp.amount / exp.participants.length);
                }
            }
        });

        // Convert to array and round
        const stats = Object.values(groupSpending).map(s => ({
            ...s,
            totalSpent: parseFloat(s.totalSpent.toFixed(2))
        }));

        res.json(stats);

    } catch (err) {
        console.error(`[getSplitterAnalytics] Error:`, err);
        res.status(500).json({ error: 'Failed to fetch analytics: ' + err.message });
    }
};

module.exports = {
    createGroup,
    getGroups,
    getGroupDetails,
    inviteMember,
    addSplitExpense,
    createSettlement,
    editSplitExpense,
    deleteGroup,
    getSplitterAnalytics
};
