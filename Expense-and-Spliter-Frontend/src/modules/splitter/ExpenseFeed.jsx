import React from 'react';

const ExpenseFeed = ({ activities, expenses, settlements, currentUserId, onExpenseClick }) => {

    // Helper to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(date);
    };

    // Helper to resolve current expense total
    const getLiveAmount = (act) => {
        if (!act.relatedId) return act.metadata?.amount;
        const currentExp = expenses?.find(e => e._id === act.relatedId);
        return currentExp ? currentExp.amount : act.metadata?.amount;
    };

    if (!activities || activities.length === 0) {
        return <div className="text-center p-10 text-slate-400 italic">No activity recorded yet.</div>;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Latest Activity</h3>
            <div className="relative border-l-2 border-indigo-100 ml-3 space-y-8 pb-4 font-inter">
                {activities.map((act) => {
                    const liveAmount = getLiveAmount(act);

                    return (
                        <div key={act._id} className="relative pl-6">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-indigo-200"></div>

                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    {formatDate(act.createdAt)}
                                </span>

                                {/* Activity Content */}
                                {act.action === 'EXPENSE_ADDED' && (
                                    <div
                                        onClick={() => act.relatedId && onExpenseClick(act.relatedId)}
                                        className="cursor-pointer group"
                                    >
                                        <p className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-800">{act.actorId?.name || 'Someone'}</span> paid for <span className="font-bold text-slate-800">"{act.metadata?.title}"</span>
                                        </p>
                                        {/* Participants Summary */}
                                        {act.relatedId && expenses?.find(e => e._id === act.relatedId) && (
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                For: {expenses.find(e => e._id === act.relatedId).participants
                                                    .map(p => p.name === act.actorId?.name ? 'Self' : p.name.split(' ')[0])
                                                    .join(', ')}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs font-bold text-indigo-600 group-hover:underline">
                                                ₹{liveAmount}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {act.action === 'EXPENSE_EDITED' && (
                                    <div
                                        onClick={() => act.relatedId && onExpenseClick(act.relatedId)}
                                        className="cursor-pointer group"
                                    >
                                        <p className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-800">{act.actorId?.name || 'Someone'}</span> modified payment for <span className="font-bold text-slate-800">"{act.metadata?.title}"</span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs font-bold text-amber-600 group-hover:underline">
                                                ₹{liveAmount}
                                            </p>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest border border-slate-100 px-1 rounded">Refined</span>
                                        </div>
                                    </div>
                                )}

                                {act.action === 'SETTLEMENT_RECORDED' && (
                                    <div>
                                        <p className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-800">{act.actorId?.name}</span> paid <span className="font-bold text-slate-800">{act.metadata?.toName}</span>
                                        </p>
                                        <p className="text-xs font-bold text-emerald-600 mt-1">
                                            ₹{act.metadata?.amount} settled
                                        </p>
                                    </div>
                                )}

                                {act.action === 'MEMBER_JOINED' && (
                                    <p className="text-sm text-slate-500 italic">
                                        <span className="font-bold text-slate-700">{act.metadata?.name}</span> joined the group.
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExpenseFeed;
