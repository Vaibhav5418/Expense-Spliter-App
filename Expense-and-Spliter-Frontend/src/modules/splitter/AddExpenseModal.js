import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Calculator, Receipt } from 'lucide-react';
import axios from 'axios';

const baseURL = process.env.REACT_APP_BASE_URL ||
    (window.location.hostname.includes('vercel.app')
        ? 'https://expense-and-spliter-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const AddExpenseModal = ({ groupId, members, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [splitType, setSplitType] = useState('EQUAL'); // EQUAL, PERCENTAGE, EXACT
    const [participants, setParticipants] = useState(members.map(m => m._id));
    const [breakdownInput, setBreakdownInput] = useState({}); // { userId: value }
    const [isLoading, setIsLoading] = useState(false);

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
            await axios.post(`${baseURL}/splitter/groups/${groupId}/expenses`, {
                title,
                amount: Number(amount),
                splitType,
                participants,
                splits: finalBreakdown
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (err) {
            alert('Transaction failed: ' + (err.response?.data?.error || err.message));
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
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Receipt className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-800">New Shared Transaction</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Record Group Expenditure</p>
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
                        className="w-full btn-primary bg-indigo-600 hover:bg-indigo-700 py-3.5 sm:py-4 uppercase tracking-[0.2em] text-[10px] sm:text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
                    >
                        {isLoading ? 'Processing Neural Ledger...' : <><Calculator className="w-4 h-4" /> Commit Transaction</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AddExpenseModal;
