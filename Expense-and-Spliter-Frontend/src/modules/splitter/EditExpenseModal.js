import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Calculator, Edit3 } from 'lucide-react';
import axios from 'axios';

const baseURL = process.env.REACT_APP_BASE_URL ||
    (window.location.hostname.includes('vercel.app')
        ? 'https://expense-and-spliter-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const EditExpenseModal = ({ expense, groupId, members, onClose, onSuccess }) => {
    const [title, setTitle] = useState(expense.title);
    const [amount, setAmount] = useState(expense.amount);
    const [splitType, setSplitType] = useState(expense.splitType);
    const [participants, setParticipants] = useState(expense.participants.map(p => typeof p === 'object' ? p._id : p));
    const [breakdownInput, setBreakdownInput] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initialize breakdown inputs from existing expense
        const splitsArray = expense.splits?.length > 0 ? expense.splits : (expense.splitBreakdown || []);
        if (splitsArray.length > 0) {
            const initialInputs = {};
            splitsArray.forEach(item => {
                const userId = typeof item.user === 'object' ? item.user._id : item.user;
                if (expense.splitType === 'PERCENTAGE') {
                    initialInputs[userId] = item.percentage;
                } else if (expense.splitType === 'EXACT') {
                    initialInputs[userId] = item.amount;
                }
            });
            setBreakdownInput(initialInputs);
        }
    }, [expense]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let finalBreakdown = [];
        if (splitType !== 'EQUAL') {
            finalBreakdown = participants.map(uid => ({
                user: uid,
                amount: splitType === 'EXACT' ? Number(breakdownInput[uid] || 0) : undefined,
                percentage: splitType === 'PERCENTAGE' ? Number(breakdownInput[uid] || 0) : undefined
            }));
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${baseURL}/splitter/expenses/${expense._id}`, {
                title,
                amount: Number(amount),
                splitType,
                participants,
                splits: finalBreakdown,
                date: expense.date // Keep original date or allow edit if needed
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleParticipant = (uid) => {
        if (participants.includes(uid)) {
            setParticipants(participants.filter(id => id !== uid));
        } else {
            setParticipants([...participants, uid]);
        }
    };

    const handleBreakdownChange = (uid, val) => {
        setBreakdownInput(prev => ({ ...prev, [uid]: val }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-5 sm:space-y-6 my-10 relative"
            >
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Edit3 className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-800">Edit Transaction</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Update Expense Details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Specification</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Dinner @ Taj"
                                className="input-field w-full font-bold"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Fiscal Value</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="input-field w-full !pl-12 font-mono text-lg font-bold text-indigo-600"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Distribution Logic</label>
                        <div className="flex p-1 bg-slate-100 rounded-xl">
                            {['EQUAL', 'PERCENTAGE', 'EXACT'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSplitType(type)}
                                    className={`flex-1 py-2 text-xs font-black uppercase tracking-wide rounded-lg transition-all ${splitType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Operatives Involved ({participants.length})</label>
                            {splitType === 'EQUAL' && (
                                <button
                                    type="button"
                                    onClick={() => setParticipants(participants.length === members.length ? [] : members.map(m => m._id))}
                                    className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                                >
                                    {participants.length === members.length ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {members.map(member => (
                                <div key={member._id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${participants.includes(member._id) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent'}`}>
                                    <div
                                        onClick={() => toggleParticipant(member._id)}
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${participants.includes(member._id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                            {participants.includes(member._id) && <Check className="w-3 h-3" />}
                                        </div>
                                        <span className={`text-sm font-bold ${participants.includes(member._id) ? 'text-indigo-900' : 'text-slate-500'}`}>{member.name || member.email}</span>
                                    </div>

                                    {participants.includes(member._id) && splitType !== 'EQUAL' && (
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                value={breakdownInput[member._id] || ''}
                                                onChange={(e) => handleBreakdownChange(member._id, e.target.value)}
                                                placeholder={splitType === 'PERCENTAGE' ? '%' : '₹'}
                                                className="w-full px-3 py-1.5 text-right text-sm font-mono font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none bg-white text-indigo-600"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary bg-amber-500 hover:bg-amber-600 py-3.5 sm:py-4 uppercase tracking-[0.2em] text-[10px] sm:text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 active:scale-[0.98] transition-all text-white"
                    >
                        {isLoading ? 'Updating Ledger...' : <><Calculator className="w-4 h-4" /> Save Changes</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default EditExpenseModal;
