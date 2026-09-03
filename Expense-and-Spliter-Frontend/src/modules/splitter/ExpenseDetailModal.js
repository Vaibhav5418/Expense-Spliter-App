import React from 'react';
import { motion } from 'framer-motion';
import { X, Edit3 } from 'lucide-react';

const ExpenseDetailModal = ({ expense, onClose, onEdit, currentUserId, members }) => {
    const canEdit = currentUserId === (expense.paidBy?._id || expense.paidBy);

    // Robust Name Resolution
    const resolveMember = (split) => {
        // 1. If populated by backend
        if (split.user && typeof split.user === 'object' && split.user.name) {
            return split.user.name;
        }
        // 2. Fallback: Search in group members list (most reliable if backend fails)
        const userId = typeof split.user === 'object' ? split.user._id : split.user;
        const member = members?.find(m => (m._id || m) === userId);
        if (member) return member.name;

        // 3. Fallback to email or generic
        return split.user?.email || 'Member';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/30 backdrop-blur-sm">
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b flex items-start justify-between bg-slate-50">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest">
                                {expense.category}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                                {new Date(expense.date).toLocaleDateString()}
                            </span>
                            {expense.edited && (
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest border border-amber-200 px-1 rounded">Edited</span>
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{expense.title}</h2>
                        <p className="text-2xl font-mono font-bold text-indigo-600 mt-1">₹{expense.amount}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-2">
                            Paid by <span className="text-slate-800">{expense.paidBy?.name || 'Unknown'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <button onClick={onEdit} className="p-2 hover:bg-amber-100 text-slate-400 hover:text-amber-600 rounded-lg transition-colors" title="Edit Expense">
                                <Edit3 className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Split Breakdown */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Split Breakdown</h3>
                        <div className="space-y-3">
                            {(expense.splits?.length > 0 ? expense.splits : (expense.splitBreakdown || [])).map((split, i) => {
                                const userName = resolveMember(split);
                                const initial = userName.charAt(0).toUpperCase();

                                return (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                {initial}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{userName}</span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-600">₹{split.amount}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notes */}
                    {expense.notes && (
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Notes</h3>
                            <p className="text-sm text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100 italic">
                                "{expense.notes}"
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ExpenseDetailModal;
