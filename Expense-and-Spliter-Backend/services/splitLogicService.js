/**
 * Calculates the split breakdown based on the split type and inputs.
 * @param {number} totalAmount 
 * @param {string} splitType 'EQUAL' | 'PERCENTAGE' | 'EXACT' | 'SHARES'
 * @param {Array} participants Array of User IDs
 * @param {Array} breakdownInput Array of { user, amount?, percentage?, shares? }
 * @returns {Array} Array of { user, amount }
 */
const calculateSplit = (totalAmount, splitType, participants, breakdownInput = []) => {
    let result = [];

    switch (splitType) {
        case 'EQUAL':
            const splitAmount = parseFloat((totalAmount / participants.length).toFixed(2));
            let remainder = totalAmount - (splitAmount * participants.length);

            result = participants.map((userId, index) => {
                let amount = splitAmount;
                // Distribute pennies to first few participants
                if (index < Math.round(remainder * 100)) {
                    amount += 0.01;
                }
                return { user: userId, amount: parseFloat(amount.toFixed(2)) };
            });
            break;

        case 'PERCENTAGE':
            let totalPercent = 0;
            result = breakdownInput.map(item => {
                if (!participants.includes(item.user)) throw new Error(`User ${item.user} not in participants list`);
                totalPercent += item.percentage || 0;
                const amount = parseFloat(((totalAmount * (item.percentage || 0)) / 100).toFixed(2));
                return { user: item.user, amount };
            });

            if (Math.abs(totalPercent - 100) > 0.01) {
                throw new Error(`Percentages must add up to 100% (Calculated: ${totalPercent}%)`);
            }
            break;

        case 'EXACT':
            let totalExact = 0;
            result = breakdownInput.map(item => {
                if (!participants.includes(item.user)) throw new Error(`User ${item.user} not in participants list`);
                totalExact += item.amount || 0;
                return { user: item.user, amount: parseFloat((item.amount || 0).toFixed(2)) };
            });

            if (Math.abs(totalExact - totalAmount) > 0.01) {
                throw new Error(`Split amounts must equal total (${totalAmount}). Sum: ${totalExact}`);
            }
            break;

        case 'SHARES':
            let totalShares = 0;
            breakdownInput.forEach(item => totalShares += (item.shares || 0));

            if (totalShares === 0) throw new Error("Total shares cannot be zero");

            result = breakdownInput.map(item => {
                const shareAmount = (totalAmount * (item.shares || 0)) / totalShares;
                return { user: item.user, amount: parseFloat(shareAmount.toFixed(2)) };
            });
            break;

        default:
            throw new Error("Invalid split type");
    }

    return result;
};

module.exports = { calculateSplit };
