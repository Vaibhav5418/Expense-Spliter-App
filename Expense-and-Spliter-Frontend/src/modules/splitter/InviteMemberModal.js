import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, X } from 'lucide-react';
import axios from 'axios';

const baseURL = process.env.REACT_APP_BASE_URL ||
    (window.location.hostname.includes('vercel.app')
        ? 'https://expense-and-spliter-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const InviteMemberModal = ({ groupId, onClose, onInviteSuccess }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${baseURL}/splitter/groups/${groupId}/invite`, { email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onInviteSuccess(email);
            setEmail('');
        } catch (err) {
            alert('Invitation failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-6 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="text-center pt-2">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">Deploy Invitation</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Add new operative to group</p>
                </div>

                <form onSubmit={handleInvite} className="space-y-5">
                    <div className="relative group">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Operative Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="agent@finpulse.com"
                            className="input-field w-full pl-4 bg-slate-50 border-slate-200 focus:border-indigo-500"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 items-center justify-center rounded-xl font-bold uppercase tracking-wide text-xs text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 items-center justify-center rounded-xl font-bold uppercase tracking-wide text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex gap-2"
                        >
                            {isLoading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Invite</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default InviteMemberModal;
