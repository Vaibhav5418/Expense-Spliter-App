import axios from 'axios';

const baseURL = process.env.REACT_APP_BASE_URL ||
    (window.location.hostname.includes('vercel.app')
        ? 'https://expense-and-spliter-backend.onrender.com/api'
        : 'http://localhost:5000/api');

/**
 * Enterprise Analytics Service
 * Aggregates data from existing REST APIs to provide deep financial insights.
 */
class SplitterAnalyticsService {
    async fetchMasterData() {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Get all groups
        const groupsRes = await axios.get(`${baseURL}/splitter/groups`, { headers });
        const groups = groupsRes.data;

        // 2. Fetch full details for each group in parallel
        const detailPromises = groups.map(g =>
            axios.get(`${baseURL}/splitter/groups/${g._id}`, { headers })
        );

        const detailsResponses = await Promise.all(detailPromises);
        return detailsResponses.map(r => r.data);
    }

    processAnalytics(masterData, currentUserId) {
        let totalWorkspaceSpend = 0;
        let totalNetPersonalSpend = 0;
        let totalYouOwe = 0;
        let totalYouAreOwed = 0;

        const groupStats = masterData.map(data => {
            const { group, expenses, settlements, balances } = data;

            // 1. Group Total Spend
            const groupTotalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            totalWorkspaceSpend += groupTotalSpend;

            // 2. Your Personal Liability (What you were supposed to pay)
            const yourLiability = expenses.reduce((sum, exp) => {
                const activeSplits = (exp.splits && exp.splits.length > 0) ? exp.splits : exp.splitBreakdown;
                const mySplit = activeSplits?.find(s => {
                    const id = s.user?._id || s.user;
                    return id?.toString() === currentUserId;
                });
                return sum + (mySplit ? mySplit.amount : 0);
            }, 0);

            // 3. Your Actual Paid (Total value of transactions paid by you)
            const yourPaid = expenses.reduce((sum, exp) => {
                const id = exp.paidBy?._id || exp.paidBy;
                return (id?.toString() === currentUserId) ? sum + exp.amount : sum;
            }, 0);

            // 4. Settlement Adjustments
            // Amount you settled TO others (Reduced your cash)
            const amountYouSettled = settlements.reduce((sum, s) => {
                const fromId = s.fromUser?._id || s.fromUser;
                return (fromId?.toString() === currentUserId && s.status === 'SETTLED') ? sum + s.amount : sum;
            }, 0);

            // Amount others settled TO you (Increased your cash)
            const amountSettledToYou = settlements.reduce((sum, s) => {
                const toId = s.toUser?._id || s.toUser;
                return (toId?.toString() === currentUserId && s.status === 'SETTLED') ? sum + s.amount : sum;
            }, 0);

            // 5. Net Personal Spend
            // Net = (Literal value of expenses you paid) - (Reimbursements you got) + (Debts you paid off)
            const netSpend = parseFloat((yourPaid - amountSettledToYou + amountYouSettled).toFixed(2));
            totalNetPersonalSpend += netSpend;

            // 6. Owe/Owed from Balances
            const myBalance = balances[currentUserId] || 0;
            if (myBalance > 0) totalYouAreOwed += myBalance;
            else totalYouOwe += Math.abs(myBalance);

            // 7. Settlement Progress
            // We use total group liability vs settled to estimate progress
            // Simple approach: Settled volume / Total expense volume
            const totalSettledInGroup = settlements.reduce((sum, s) => s.status === 'SETTLED' ? sum + s.amount : sum, 0);
            // Rough progress: Total settled / Total that needed splitting (GroupTotal - Individual Self-Shares?)
            // More accurately: % of debts cleared?
            // Let's stick to a simple % of total group value handled by settlements
            const progress = groupTotalSpend > 0 ? Math.min(100, (totalSettledInGroup / groupTotalSpend) * 100) : 100;

            return {
                id: group._id,
                name: group.name,
                groupTotalSpend,
                yourLiability,
                yourPaid,
                netSpend,
                progress,
                myBalance,
                monthlyHistory: this.extractMonthlyHistory(expenses, currentUserId)
            };
        });

        // Combined Monthly History
        const combinedHistory = this.mergeMonthlyHistories(groupStats.map(g => g.monthlyHistory));

        return {
            kpis: {
                totalWorkspaceSpend: parseFloat(totalWorkspaceSpend.toFixed(2)),
                totalNetPersonalSpend: parseFloat(totalNetPersonalSpend.toFixed(2)),
                totalYouOwe: parseFloat(totalYouOwe.toFixed(2)),
                totalYouAreOwed: parseFloat(totalYouAreOwed.toFixed(2)),
                activeGroups: groupStats.length
            },
            groupStats,
            combinedHistory
        };
    }

    extractMonthlyHistory(expenses, currentUserId) {
        const history = {};
        expenses.forEach(exp => {
            const date = new Date(exp.date || exp.createdAt);
            const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            if (!history[key]) history[key] = 0;

            // We track your liability over time
            const activeSplits = (exp.splits && exp.splits.length > 0) ? exp.splits : exp.splitBreakdown;
            const mySplit = activeSplits?.find(s => {
                const id = s.user?._id || s.user;
                return id?.toString() === currentUserId;
            });
            if (mySplit) history[key] += mySplit.amount;
        });
        return history;
    }

    mergeMonthlyHistories(histories) {
        const merged = {};
        histories.forEach(h => {
            for (const [month, amount] of Object.entries(h)) {
                merged[month] = (merged[month] || 0) + amount;
            }
        });
        // Sort by date key (this is tricky with "Short Year" format, but usually browser sorts roughly)
        // Better: return as array sorted by actual date
        return Object.entries(merged).map(([month, amount]) => ({ month, amount }));
    }
}

const splitterAnalyticsService = new SplitterAnalyticsService();
export default splitterAnalyticsService;
