import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, Plus, TrendingUp } from 'lucide-react';
import InviteMemberModal from './InviteMemberModal';
import AddExpenseModal from './AddExpenseModal';
import ExpenseFeed from './ExpenseFeed';
import BalanceGrid from './BalanceGrid';
import ExpenseDetailModal from './ExpenseDetailModal';
import EditExpenseModal from './EditExpenseModal';
import SettlementConfirmationModal from './SettlementConfirmationModal';
import { getStoredUser, getValidToken } from '../../utils/auth';

const baseURL = (import.meta.env?.VITE_BASE_URL || process.env.REACT_APP_BASE_URL) ||
    (window.location.hostname.includes('vercel.app')
        ? 'https://expense-and-spliter-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const GroupDashboard = ({ groupId, onBack }) => {
    const [groupData, setGroupData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(() => {
        const user = getStoredUser();
        return user ? (user._id || user.userId) : null;
    });

    // New State for Edit/Settle
    const [editingExpense, setEditingExpense] = useState(null);
    const [settlementDebt, setSettlementDebt] = useState(null);

    const fetchDetails = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const token = getValidToken();
            if (!token) return;
            const res = await axios.get(`${baseURL}/splitter/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroupData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    // Background Polling
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDetails(true); // Silent update
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, [fetchDetails]);

    if (isLoading) return <div className="p-10 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Syncing Neural Ledger...</div>;
    if (!groupData) return <div className="p-10 text-center text-rose-500 font-bold">Data retrieval failed. System Error.</div>;

    const { group, expenses, simplifiedDebts, balances, activities } = groupData;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 font-inter">
                    <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm active:scale-95">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight truncate">{group.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                                {group.members.length} Operatives
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowInviteModal(true)}
                        className="btn-ghost flex-1 sm:flex-none bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600 transition-all"
                    >
                        <UserPlus className="w-4 h-4" /> <span className="sm:inline">Invite</span>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowExpenseModal(true)}
                        className="btn-primary flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-white transition-all"
                    >
                        <Plus className="w-4 h-4 text-white" /> <span className="sm:inline">Add Expense</span>
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Balances & Settle Plan */}
                <div className="space-y-6">
                    <BalanceGrid balances={balances} currentUserId={currentUserId} />

                    <div className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-emerald-50 rounded-xl shadow-inner">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Settlement Plan</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Clearing Neural Debts</p>
                            </div>
                        </div>

                        {simplifiedDebts.length === 0 ? (
                            <p className="text-sm font-bold text-slate-400 italic">All debts settled.</p>
                        ) : (
                            <div className="grid gap-3">
                                {simplifiedDebts.map((debt, i) => {
                                    const fromUser = group.members.find(m => m._id === debt.from);
                                    const toUser = group.members.find(m => m._id === debt.to);

                                    // Highlight if it involves me
                                    const involvesMe = debt.from === currentUserId || debt.to === currentUserId;
                                    const iOwe = debt.from === currentUserId;

                                    return (
                                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${involvesMe ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="text-xs">
                                                <span className="font-bold text-slate-700">{debt.from === currentUserId ? 'You' : fromUser?.name.split(' ')[0]}</span>
                                                <span className="text-slate-400 mx-1">→</span>
                                                <span className="font-bold text-slate-700">{debt.to === currentUserId ? 'You' : toUser?.name.split(' ')[0]}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono font-bold text-emerald-600 text-sm">₹{debt.amount}</div>
                                                {iOwe && (
                                                    <button
                                                        onClick={() => setSettlementDebt({
                                                            from: debt.from,
                                                            to: debt.to,
                                                            amount: debt.amount,
                                                            fromName: 'You',
                                                            toName: toUser?.name || 'Unknown'
                                                        })}
                                                        className="px-2 py-1 bg-emerald-600 text-white text-[10px] uppercase font-bold rounded hover:bg-emerald-700 transition-colors"
                                                    >
                                                        Settle
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative overflow-hidden p-4 sm:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[400px] sm:min-h-[500px]">
                        <ExpenseFeed
                            activities={activities}
                            expenses={expenses}
                            currentUserId={currentUserId}
                            onExpenseClick={(id) => {
                                const exp = expenses.find(e => e._id === id);
                                if (exp) setSelectedExpense(exp);
                            }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showInviteModal && (
                    <InviteMemberModal
                        groupId={groupId}
                        onClose={() => setShowInviteModal(false)}
                        onInviteSuccess={() => { /* Refresh? */ }}
                    />
                )}
                {showExpenseModal && (
                    <AddExpenseModal
                        groupId={groupId}
                        members={group.members}
                        onClose={() => setShowExpenseModal(false)}
                        onSuccess={() => {
                            setShowExpenseModal(false);
                            fetchDetails();
                        }}
                    />
                )}
                {selectedExpense && (
                    <ExpenseDetailModal
                        expense={selectedExpense}
                        currentUserId={currentUserId}
                        members={group.members}
                        onClose={() => setSelectedExpense(null)}
                        onUpdate={() => {
                            fetchDetails(); // Refresh parent data
                        }}
                        onEdit={() => {
                            setEditingExpense(selectedExpense);
                            setSelectedExpense(null);
                        }}
                    />
                )}
                {editingExpense && (
                    <EditExpenseModal
                        expense={editingExpense}
                        groupId={groupId}
                        members={group.members}
                        onClose={() => setEditingExpense(null)}
                        onSuccess={() => {
                            setEditingExpense(null);
                            fetchDetails();
                        }}
                    />
                )}
                {settlementDebt && (
                    <SettlementConfirmationModal
                        debt={settlementDebt}
                        groupId={groupId}
                        onClose={() => setSettlementDebt(null)}
                        onSuccess={() => {
                            setSettlementDebt(null);
                            fetchDetails();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default GroupDashboard;
