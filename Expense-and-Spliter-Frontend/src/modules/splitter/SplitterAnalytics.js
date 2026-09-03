import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { motion, animate } from 'framer-motion';
import {
    Activity, Wallet,
    ArrowUpRight, ArrowDownRight, Users,
    Calendar, MoreHorizontal
} from 'lucide-react';
import analyticsService from './services/splitterAnalyticsService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// --- Animated Counter Component ---
const Counter = ({ value, prefix = "", suffix = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(latest)
        });
        return () => controls.stop();
    }, [value]);

    return <span>{prefix}{displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}{suffix}</span>;
};

// --- KPI Card Component ---
const KPICard = ({ title, value, icon: Icon, color, delay, prefix }) => {
    const colorClasses = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="relative overflow-hidden p-5 sm:p-6 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl ${colorClasses[color]} border transition-transform group-hover:scale-110 duration-500`}>
                    <Icon className="h-6 w-6" />
                </div>
                {value > 0 && <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Metric</div>}
            </div>
            <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{title}</h4>
                <div className="text-3xl font-black text-slate-800 tracking-tight">
                    <Counter value={value} prefix={prefix} />
                </div>
            </div>
            {/* Background Decorative Element */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${colorClasses[color]} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`} />
        </motion.div>
    );
};

const SplitterAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentUserId = useMemo(() => {
        const token = localStorage.getItem('token');
        if (!token || !token.includes('.')) return null;
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const payload = JSON.parse(atob(parts[1]));
            return payload.id || payload.userId || payload.sub;
        } catch (e) { return null; }
    }, []);

    const fetchAnalyticsData = useCallback(async () => {
        setLoading(true);
        try {
            const masterData = await analyticsService.fetchMasterData();
            const processed = analyticsService.processAnalytics(masterData, currentUserId);
            setAnalytics(processed);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    // --- Chart Configs ---
    const doughnutData = analytics ? {
        labels: analytics.groupStats.map(g => g.name),
        datasets: [{
            data: analytics.groupStats.map(g => g.groupTotalSpend),
            backgroundColor: [
                'rgba(79, 70, 229, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(244, 63, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
            ],
            borderWidth: 0,
            hoverOffset: 20
        }]
    } : null;

    const barData = analytics ? {
        labels: analytics.groupStats.map(g => g.name),
        datasets: [
            {
                label: 'Actually Paid',
                data: analytics.groupStats.map(g => g.yourPaid),
                backgroundColor: 'rgba(79, 70, 229, 0.9)',
                borderRadius: 12,
            },
            {
                label: 'Personal Liability',
                data: analytics.groupStats.map(g => g.yourLiability),
                backgroundColor: 'rgba(226, 232, 240, 1)',
                borderRadius: 12,
            }
        ]
    } : null;

    const lineData = analytics ? {
        labels: analytics.combinedHistory.map(h => h.month),
        datasets: [{
            label: 'Liability Trend',
            data: analytics.combinedHistory.map(h => h.amount),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#4f46e5',
            pointBorderWidth: 3
        }]
    } : null;

    if (loading || !analytics) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent"
                    />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Aggregating Workspace Intelligence...</p>
            </div>
        );
    }

    const { kpis, groupStats } = analytics;

    return (
        <div className="space-y-10 pb-20 font-inter">
            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard title="Workspace Spends" value={kpis.totalWorkspaceSpend} icon={Activity} color="indigo" prefix="₹" delay={0} />
                <KPICard title="Your Net Spend" value={kpis.totalNetPersonalSpend} icon={Wallet} color="emerald" prefix="₹" delay={0.1} />
                <KPICard title="You Owe" value={kpis.totalYouOwe} icon={ArrowUpRight} color="rose" prefix="₹" delay={0.2} />
                <KPICard title="You Are Owed" value={kpis.totalYouAreOwed} icon={ArrowDownRight} color="blue" prefix="₹" delay={0.3} />
                <KPICard title="Active Groups" value={kpis.activeGroups} icon={Users} color="amber" delay={0.4} />
            </div>

            {/* Middle Section: Spend Distribution & Liability */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Doughnut: Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-white border border-slate-100 shadow-xl lg:col-span-1"
                >
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-slate-800">Budget Footprint</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Group Spend Distribution</p>
                    </div>
                    <div className="relative h-[280px] flex items-center justify-center">
                        <Doughnut
                            data={doughnutData}
                            options={{
                                cutout: '75%',
                                plugins: { legend: { display: false } },
                                maintainAspectRatio: false
                            }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                            <span className="text-xl font-black text-slate-800">₹{kpis.totalWorkspaceSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                    <div className="mt-8 space-y-3">
                        {groupStats.slice(0, 4).map((g, idx) => (
                            <div key={g.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[idx] }} />
                                    <span className="font-bold text-slate-600 truncate max-w-[120px]">{g.name}</span>
                                </div>
                                <span className="font-black text-slate-400">{((g.groupTotalSpend / kpis.totalWorkspaceSpend) * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Bar: Paid vs Liability */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-white border border-slate-100 shadow-xl lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Participation Index</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Paid vs Personal Liability</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={fetchAnalyticsData}
                                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-95"
                                title="Sync Data"
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <Bar
                            data={barData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { grid: { display: false }, ticks: { font: { weight: 'bold' }, color: '#94a3b8' } },
                                    x: { grid: { display: false }, ticks: { font: { weight: 'bold' }, color: '#94a3b8' } }
                                }
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section: Progress & Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Settlement Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-white border border-slate-100 shadow-xl"
                >
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-slate-800">Settlement Velocity</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Completion Progress per Group</p>
                    </div>
                    <div className="space-y-6">
                        {groupStats.map(g => (
                            <div key={g.id} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-black text-slate-700">{g.name}</span>
                                    <span className="text-xs font-black text-indigo-600">{g.progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${g.progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                    />
                                </div>
                            </div>
                        ))}
                        {groupStats.length === 0 && <p className="text-center text-slate-400 italic">No groups found.</p>}
                    </div>
                </motion.div>

                {/* Timeline Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-indigo-900 border border-indigo-800 shadow-2xl overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Spend Timeline</h3>
                                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Historical Liability Trend</p>
                            </div>
                        </div>
                        <div className="h-[250px]">
                            <Line
                                data={lineData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: { weight: 'bold' } } },
                                        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { weight: 'bold' } } }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32" />
                </motion.div>
            </div>
        </div>
    );
};

export default SplitterAnalytics;
