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
 * Simplifies debts for a group using a min-cash-flow-like algo
 * @param {string} groupId 
 */
const simplifyDebts = async (groupId) => {
    // 1. Fetch all expenses and settlements
    const expenses = await SplitExpense.find({ groupId });
    const settlements = await Settlement.find({ groupId, status: 'SETTLED' });

    // 2. Calculate Net Balance for each user
    let balances = {}; // { userId: netAmount }

    // Helper to add/sub with rounding
    const add = (uid, amount) => {
        if (!uid) return;
        if (!balances[uid]) balances[uid] = 0;
        balances[uid] = parseFloat((balances[uid] + amount).toFixed(2));
    };

    // Process Expenses
    expenses.forEach(exp => {
        const payerId = toId(exp.paidBy);
        add(payerId, exp.amount);

        // Determine which split array to use
        const activeSplits = (exp.splits && exp.splits.length > 0) ? exp.splits : exp.splitBreakdown;

        if (activeSplits && activeSplits.length > 0) {
            activeSplits.forEach(split => {
                const userId = toId(split.user);
                add(userId, -split.amount);
            });
        } else {
            // Fallback for missing splits
            const participants = exp.participants || [];
            if (participants.length > 0) {
                const share = exp.amount / participants.length;
                participants.forEach(pId => add(toId(pId), -share));
            }
        }
    });

    // Process Settlements
    settlements.forEach(settle => {
        const fromId = toId(settle.fromUser);
        const toIdVal = toId(settle.toUser);
        add(fromId, settle.amount);
        add(toIdVal, -settle.amount);
    });

    // 3. Separate Debtors and Creditors
    let debtors = [];
    let creditors = [];

    for (const [userId, amount] of Object.entries(balances)) {
        const net = Math.round(amount * 100) / 100;
        if (net < -0.01) debtors.push({ userId, amount: net });
        if (net > 0.01) creditors.push({ userId, amount: net });
    }

    // Sort by magnitude
    debtors.sort((a, b) => a.amount - b.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    // 4. Match debts
    let simplifiedDebts = [];
    let i = 0; // creditor index
    let j = 0; // debtor index

    while (i < creditors.length && j < debtors.length) {
        let creditor = creditors[i];
        let debtor = debtors[j];

        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
        amount = Math.round(amount * 100) / 100;

        simplifiedDebts.push({
            from: debtor.userId,
            to: creditor.userId,
            amount
        });

        creditor.amount -= amount;
        debtor.amount += amount;

        if (Math.abs(creditor.amount) < 0.01) i++;
        if (Math.abs(debtor.amount) < 0.01) j++;
    }

    return simplifiedDebts;
};

module.exports = { simplifyDebts };
