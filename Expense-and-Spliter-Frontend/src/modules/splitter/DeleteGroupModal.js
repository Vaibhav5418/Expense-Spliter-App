import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteGroupModal = ({ groupName, onConfirm, onCancel, isOpen }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100"
                    >
                        {/* Header Decoration */}
                        <div className="h-2 bg-rose-500 w-full" />

                        <div className="p-8">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                                </div>
                            </div>

                            <div className="text-center space-y-3">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Permanent Deletion</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Are you sure you want to delete <span className="font-bold text-slate-800">"{groupName}"</span>?
                                    This action cannot be undone and all associated expenses will be lost.
                                </p>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Confirm Deletion
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold uppercase tracking-widest text-xs rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteGroupModal;
