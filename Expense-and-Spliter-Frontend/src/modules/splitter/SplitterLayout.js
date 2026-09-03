import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import GroupList from './GroupList';
import GroupDashboard from './GroupDashboard';
import SplitterAnalytics from './SplitterAnalytics';

const baseURL = process.env.REACT_APP_BASE_URL ||
    (window.location.hostname.includes('vercel.app')
        ? 'https://expense-and-spliter-backend.onrender.com/api'
        : 'http://localhost:5000/api');

const SplitterLayout = ({ isInsights }) => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [, setIsLoading] = useState(false);

    const fetchGroups = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${baseURL}/splitter/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(res.data);
        } catch (err) {
            console.error('Failed to fetch groups', err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // Background Polling for Group List
    useEffect(() => {
        const interval = setInterval(() => {
            if (!groupId) { // Only poll when on the list view
                fetchGroups(true);
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, [groupId]);

    const handleGroupSelect = (id) => {
        navigate(`/splitter/${id}`);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-1000">
            {/* Header with Dashboard Glass Tokens */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sticky top-0 bg-[var(--background)]/80 backdrop-blur-xl z-30 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 border-b border-[var(--border)]/50">
                <div className="flex items-center justify-between lg:justify-start gap-4">
                    <div className="lg:hidden w-12" /> {/* Spacer for mobile menu trigger */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--foreground)] flex items-center gap-3">
                            <div className={`hidden sm:block w-2 h-8 rounded-full ${isInsights ? 'bg-amber-500' : 'bg-indigo-600'}`} />
                            {isInsights ? 'Workspace Intelligence' : groupId ? 'Group Command' : 'Workspace Groups'}
                        </h2>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mt-1 sm:mt-2">
                            {isInsights ? 'Portfolio Audit Node' : groupId ? 'Active Operation Overview' : 'Collaborative Expense Ledger'}
                        </p>
                    </div>
                </div>

                {groupId && (
                    <button
                        onClick={() => navigate('/splitter')}
                        className="btn-ghost flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600"
                    >
                        Esc back to Workspace
                    </button>
                )}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {isInsights ? (
                    <motion.div
                        key="insights"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <SplitterAnalytics />
                    </motion.div>
                ) : !groupId ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <GroupList
                            groups={groups}
                            onSelect={handleGroupSelect}
                            onRefresh={fetchGroups}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <GroupDashboard
                            groupId={groupId}
                            onBack={() => navigate('/splitter')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SplitterLayout;
