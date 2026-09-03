import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ArrowRight, Trash2 } from 'lucide-react';
import axios from 'axios';
import DeleteGroupModal from './DeleteGroupModal';

const baseURL = process.env.REACT_APP_BASE_URL ||
    (window.location.hostname.includes('vercel.app')
        ? 'https://expense-and-spliter-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const GroupList = ({ groups, onSelect, onRefresh }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [groupToDelete, setGroupToDelete] = useState(null); // { id, name }

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${baseURL}/splitter/groups`, {
                name: newGroupName,
                description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewGroupName('');
            setDescription('');
            setIsCreating(false);
            onRefresh();
        } catch (err) {
            alert('Failed to create group');
        }
    };

    const handleDeleteGroup = async () => {
        if (!groupToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${baseURL}/splitter/groups/${groupToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroupToDelete(null);
            onRefresh();
        } catch (err) {
            alert('Failed to delete group');
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Create Group Card Ported from KPI DNA */}
                <motion.div
                    whileHover={{ y: -5, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreating(true)}
                    className="relative overflow-hidden p-6 sm:p-8 min-h-[160px] sm:min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 hover:border-indigo-500 cursor-pointer group bg-white/50 backdrop-blur-sm hover:bg-white transition-all rounded-2xl shadow-sm hover:shadow-xl group"
                >
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:rotate-12 transition-all duration-500 shadow-inner">
                        <Plus className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="text-center">
                        <span className="font-black text-slate-800 uppercase tracking-widest text-[10px] block mb-1">New Operation</span>
                        <span className="font-bold text-indigo-600 uppercase tracking-tight text-sm">Initialize Group</span>
                    </div>
                    {/* Decorative Background Pulsar */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-indigo-500 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500" />
                </motion.div>

                {/* Existing Groups with Premium DNA */}
                {groups.map(group => (
                    <motion.div
                        key={group._id}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(group._id)}
                        className="relative overflow-hidden p-6 sm:p-7 bg-white border border-slate-100 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group flex flex-col justify-between rounded-2xl min-h-[160px] sm:min-h-[200px]"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3.5 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-all duration-500 shadow-sm">
                                    <Users className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em]">
                                        {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setGroupToDelete({ id: group._id, name: group.name });
                                        }}
                                        className="p-1.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        title="Delete Group"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors uppercase">{group.name}</h3>
                            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{group.description || 'Sector Alpha Briefing'}</p>
                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
                            <div className="flex -space-x-2.5 overflow-hidden">
                                {group.members.slice(0, 3).map((m, i) => (
                                    <div key={i} className="inline-flex h-9 w-9 rounded-xl ring-2 ring-white bg-indigo-50 items-center justify-center text-xs font-black text-indigo-600 uppercase shadow-sm" title={m.name}>
                                        {m.name ? m.name[0] : (m.email ? m.email[0] : '?')}
                                    </div>
                                ))}
                                {group.members.length > 3 && (
                                    <div className="inline-flex h-9 w-9 rounded-xl ring-2 ring-white bg-slate-50 items-center justify-center text-[10px] font-black text-slate-400 uppercase shadow-sm">
                                        +{group.members.length - 3}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-400 transition-colors">Enter</span>
                                <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 transition-all duration-500 -translate-x-1 group-hover:translate-x-0" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Group Modal */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100"
                        >
                            <div className="text-center">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">Create Collaboration Group</h3>
                                <p className="text-xs text-indigo-500 font-bold uppercase tracking-[0.2em] mt-2">Establish new expense tracking entity</p>
                            </div>

                            <form onSubmit={(e) => { handleCreateGroup(e); setIsCreating(false); }} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Group Designation</label>
                                    <input
                                        value={newGroupName}
                                        onChange={e => setNewGroupName(e.target.value)}
                                        placeholder="e.g. Goa Trip 2026"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm transition-all"
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mission Ops (Description)</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Briefing details..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-sm transition-all min-h-[100px] resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wide text-xs text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wide text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                                    >
                                        Initialize
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <DeleteGroupModal
                isOpen={!!groupToDelete}
                groupName={groupToDelete?.name}
                onConfirm={handleDeleteGroup}
                onCancel={() => setGroupToDelete(null)}
            />
        </div>
    );
};

export default GroupList;
