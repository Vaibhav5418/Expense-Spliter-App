import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const baseURL = process.env.REACT_APP_BASE_URL ||
    (window.location.hostname.includes('vercel.app')
        ? 'https://expense-and-spliter-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const SettlementConfirmationModal = ({ debt, groupId, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);

    // debt object: { from: userId, to: userId, amount: number, fromName: string, toName: string }

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${baseURL}/splitter/groups/${groupId}/settlements`, {
                toUserId: debt.to,
                amount: debt.amount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (err) {
            alert('Settlement failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center"
            >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Confirm Settlement</h3>
                <p className="text-slate-500 text-sm mb-6">
                    Mark this debt as settled?
                </p>

                <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                        <span>From</span>
                        <span>To</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                        <span>{debt.fromName}</span>
                        <span>{debt.toName}</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-emerald-600">
                        ₹{debt.amount}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Settling...' : <><Check className="w-4 h-4" /> Confirm</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SettlementConfirmationModal;
