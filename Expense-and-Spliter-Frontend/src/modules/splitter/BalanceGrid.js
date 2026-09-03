import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const BalanceGrid = ({ balances, currentUserId }) => {
    const myBalance = balances && balances[currentUserId] ? balances[currentUserId] : 0;

    // Determine status
    const isOwed = myBalance > 0;
    const isDebt = myBalance < 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all ${isOwed ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-800/60">Asset Yield</span>
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shadow-inner">
                        <ArrowDownLeft className="w-4 h-4" />
                    </div>
                </div>
                <div className={`text-2xl font-black tracking-tight ${isOwed ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {isOwed ? `₹${myBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00'}
                </div>
                <div className="text-[10px] font-bold text-emerald-600/40 uppercase mt-1 tracking-widest">You are owed</div>
                {/* Decorative background element */}
                <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-emerald-500 opacity-[0.03]" />
            </div>

            <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all ${isDebt ? 'bg-rose-50/50 border-rose-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-800/60">Liability Node</span>
                    <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shadow-inner">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                </div>
                <div className={`text-2xl font-black tracking-tight ${isDebt ? 'text-rose-700' : 'text-slate-400'}`}>
                    {isDebt ? `₹${Math.abs(myBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00'}
                </div>
                <div className="text-[10px] font-bold text-rose-600/40 uppercase mt-1 tracking-widest">You owe</div>
                {/* Decorative background element */}
                <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-rose-500 opacity-[0.03]" />
            </div>
        </div>
    );
};

export default BalanceGrid;
