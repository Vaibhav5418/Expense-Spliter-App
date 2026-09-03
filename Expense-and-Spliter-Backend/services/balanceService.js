const SplitExpense = require('../models/SplitExpense');
const Settlement = require('../models/Settlement');

/**
 * Robust helper to get ID string regardless of population or object type
 */
const toId = (user) => {
    if (!user) return null;
    if (typeof user === 'string') return user;
    if (user._id) return user._id.toString();
    return user.toString();
};

/**
 * Calculates net balances for all group members with currency precision.
 * @param {string} groupId 
 */
const getGroupBalances = async (groupId) => {
    // 1. Fetch all expenses and settlements
    const expenses = await SplitExpense.find({ groupId });
    const settlements = await Settlement.find({ groupId, status: 'SETTLED' });

    const balances = {}; // { userId: netAmount } (+ve means owed, -ve means owes)

    // Helper to add/sub
    const add = (uid, amount) => {
        if (!uid) return;
        if (!balances[uid]) balances[uid] = 0;
        balances[uid] = parseFloat((balances[uid] + amount).toFixed(2));
    };

    // 2. Process Expenses
    expenses.forEach(exp => {
        const paidBy = toId(exp.paidBy);
        const total = exp.amount;

        // Payer gets +total
        add(paidBy, total);

        // Determine which split array to use
        const activeSplits = (exp.splits && exp.splits.length > 0) ? exp.splits : exp.splitBreakdown;

        if (activeSplits && activeSplits.length > 0) {
            // Participants owe their share (-share)
            activeSplits.forEach(split => {
                const debtor = toId(split.user);
                add(debtor, -split.amount);
            });
        } else {
            // Fallback: This should not happen with current logic, 
            // but if splits are missing, assume equally split among participants
            const participants = exp.participants || [];
            if (participants.length > 0) {
                const share = total / participants.length;
                participants.forEach(pId => {
                    add(toId(pId), -share);
                });
            }
        }
    });

    // 3. Process Settlements
    settlements.forEach(settle => {
        const from = toId(settle.fromUser);
        const to = toId(settle.toUser);
        const amt = settle.amount;

        add(from, amt);
        add(to, -amt);
    });

    return balances;
};

module.exports = { getGroupBalances };
