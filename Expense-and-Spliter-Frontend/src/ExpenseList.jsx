import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Download, Edit3, Trash2, Save, X, TrendingUp, Calendar,
  Plus, Calculator, PieChart,
  Repeat, ArrowUpRight, ArrowDownRight, Tag, Search, Filter,
  ArrowUpDown, BrainCircuit, Wallet, History, Sparkles, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Pie, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, PointElement, LineElement, BarElement, Filler
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getValidToken, logoutUser } from './utils/auth';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);

const cn = (...inputs) => twMerge(clsx(inputs));
const baseURL = (import.meta.env?.VITE_BASE_URL || process.env.REACT_APP_BASE_URL) ||
  (window.location.hostname.includes('vercel.app')
    ? 'https://expense-and-spliter-backend.onrender.com/api'
    : 'http://localhost:5000/api');

const ExpenseFormComponent = ({ onAdd, categories, onAddCategory, onClose, notify }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    paymentMode: 'Cash',
    isRecurring: false,
    recurringFrequency: 'Monthly'
  });
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);

  const handleSubmit = async () => {
    if (formData.title && formData.amount && formData.date) {
      if (!formData.category) {
        notify('Executing AI classification...', 'info');
        setIsClassifying(true);
      }
      await onAdd({
        ...formData,
        amount: Number(formData.amount)
      });
      notify('Transaction committed to ledger', 'success');
      setIsClassifying(false);
      setFormData({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        paymentMode: 'Cash', // Keep last selected payment mode
        isRecurring: false,
        recurringFrequency: 'Monthly'
      });
      if (onClose) onClose();
    } else {
      notify('Missing mandatory audit parameters', 'error');
    }
  };

  const handleAddCustomCat = () => {
    if (newCat) {
      onAddCategory(newCat);
      setFormData({ ...formData, category: newCat });
      setNewCat('');
      setShowCustomCat(false);
    }
  };

  const handleTitleBlur = async () => {
    if (formData.title && !formData.category && !isClassifying) {
      setIsClassifying(true);
      try {
        const token = getValidToken();
        if (!token) return;
        const res = await fetch(`${baseURL}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title: formData.title })
        });
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            category: data.category
          }));
        }
      } catch (err) {
        console.error('AI Prediction failed', err);
      } finally {
        setIsClassifying(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="enterprise-card p-4 sm:p-8 space-y-6 sm:space-y-8 bg-gradient-to-br from-[var(--card)] to-slate-50"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-green-100 rounded-2xl shadow-inner">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
          <span className="text-lg sm:text-xl">New Transaction Entry</span>
        </h3>
        {onClose && (
          <button onClick={onClose} className="btn-ghost p-2 opacity-50 hover:opacity-100">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="space-y-4 sm:space-y-5">
          <div className="relative group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Specification</label>
            <input
              type="text"
              placeholder="e.g., Azure Infrastructure"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onBlur={handleTitleBlur}
              className="input-field"
            />
          </div>
          <div className="relative group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Expense</label>
            <div className="flex items-center bg-green-50 border border-transparent rounded-xl focus-within:border-green-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-600/10 transition-all overflow-hidden px-4">
              <span className="font-bold text-green-600 font-mono mr-3">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full py-3 bg-transparent outline-none font-mono font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div className="relative group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Effective Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="relative group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Sector Class</label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') setShowCustomCat(true);
                  else setFormData({ ...formData, category: e.target.value });
                }}
                className="input-field appearance-none cursor-pointer pr-10"
              >
                <option value="">AI Predictive Filter ✨</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="ADD_NEW">+ Create New Sector</option>
              </select>
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div className="relative group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Asset Channel</label>
            <select
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              className="input-field cursor-pointer"
            >
              {['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 sm:py-4 bg-slate-50 rounded-2xl border border-transparent group-focus-within:border-emerald-500/10 transition-all">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-5 h-5 rounded-lg border-green-300 text-green-600 focus:ring-green-600 transition-all"
              />
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Pipeline Entry</span>
            </label>
            {formData.isRecurring && (
              <select
                value={formData.recurringFrequency}
                onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                className="flex-1 px-3 py-1 bg-[var(--card)] border border-green-200 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-green-600 transition-all"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {showCustomCat && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col sm:flex-row gap-3 p-4 sm:p-5 bg-green-600/5 rounded-2xl border border-green-600/20">
          <input
            type="text"
            placeholder="Specify new sector"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="input-field flex-1"
          />
          <div className="flex gap-2">
            <button onClick={handleAddCustomCat} className="btn-primary flex-1 whitespace-nowrap">Register Sector</button>
            <button onClick={() => setShowCustomCat(false)} className="btn-ghost flex-1 sm:flex-none">Abort</button>
          </div>
        </motion.div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isClassifying}
        className="btn-primary w-full py-4 sm:py-5 uppercase tracking-[0.2em] text-xs"
      >
        {isClassifying ? (
          <><Sparkles className="h-5 w-5 animate-pulse" /> Executing Insight Categorization...</>
        ) : (
          <><CheckCircle2 className="h-5 w-5" /> Commit Ledger Transaction</>
        )}
      </button>
    </motion.div>
  );
};

const ExpenseList = ({ activeTab }) => {
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedExpense, setEditedExpense] = useState({ title: '', amount: '', date: '', category: '', paymentMode: '' });
  const [error, setError] = useState(null); // Used as a generic toast state now: { message, type: 'error' | 'success' | 'info' }
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState(['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others']);
  const [insights, setInsights] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAddForm, setShowAddForm] = useState(false);

  const notify = useCallback((message, type = 'info') => {
    setError({ message, type });
    setTimeout(() => setError(null), 5000);
  }, []);

  const token = getValidToken();

  const fetchCategories = useCallback(async () => {
    const activeToken = getValidToken();
    if (!activeToken) return;
    try {
      const res = await fetch(`${baseURL}/categories`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (res.status === 401) {
        logoutUser();
        return;
      }
      if (res.ok) {
        const custom = await res.json();
        const customNames = custom.map(c => c.name);
        setCategories(['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others', ...new Set(customNames)]);
      }
    } catch { }
  }, []);

  const fetchInsights = useCallback(async () => {
    const activeToken = getValidToken();
    if (!activeToken) return;
    try {
      const res = await fetch(`${baseURL}/insights`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (res.status === 401) {
        logoutUser();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch { }
  }, []);

  const fetchExpenses = useCallback(async () => {
    const activeToken = getValidToken();
    if (!activeToken) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${baseURL}/expenses`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (res.status === 401) {
        logoutUser();
        return;
      }
      if (!res.ok) throw new Error('Failed to synchronize ledger');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchInsights();
  }, [fetchExpenses, fetchCategories, fetchInsights]);

  const addCustomCategory = async (name) => {
    try {
      const res = await fetch(`${baseURL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        setCategories(prev => [...new Set([...prev, name])]);
      }
    } catch { }
  };

  const addExpense = async (newExpense) => {
    try {
      const res = await fetch(`${baseURL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newExpense)
      });
      if (!res.ok) throw new Error('Transaction execution failed');

      // Full Sync to ensure consistency across all related pages
      fetchExpenses();
      fetchInsights();
      notify('Transaction established in ledger', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Executing high-level data purge. Confirm record termination?')) return;
    try {
      await fetch(`${baseURL}/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setExpenses(expenses.filter(e => e._id !== id));
      fetchInsights();
      notify('Record purged successfully', 'success');
    } catch (err) {
      notify('Internal system error during record termination', 'error');
    }
  };

  const startEditing = (expense) => {
    setEditingId(expense._id);
    setEditedExpense({
      title: expense.title,
      amount: expense.amount,
      date: expense.date.split('T')[0],
      category: expense.category || 'Others',
      paymentMode: expense.paymentMode || 'Cash',
      isRecurring: expense.isRecurring || false,
      recurringFrequency: expense.recurringFrequency || 'Monthly'
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedExpense(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${baseURL}/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedExpense)
      });
      if (!res.ok) throw new Error('Record reconciliation failed');
      const updated = await res.json();
      setExpenses(expenses.map(e => (e._id === id ? updated : e)));
      setEditingId(null);
      fetchInsights();
      notify('Transaction updated successfully', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    const dateStr = new Date().toISOString().split('T')[0];

    // Enterprise Header
    doc.setFillColor(22, 163, 74); // Green-600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FinPulse Enterprise Ledger', 15, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generation Timestamp: ${timestamp}`, 150, 15);
    doc.text('Authentic Operational Audit Record', 150, 22);

    // Summary Section
    doc.setTextColor(5, 46, 22); // Green-950
    doc.setFontSize(14);
    doc.text('Operational Summary', 15, 55);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Total Transaction Volume: ${expenses.length} Units`, 15, 65);
    doc.text(`Aggregated Expenditure: INR ${analytics.totalExpenses.toLocaleString()}`, 15, 72);
    doc.text(`Average Burn Rate: INR ${Math.round(insights?.avgDailySpend || 0).toLocaleString()}/day`, 150, 65);
    doc.text(`Primary Sector: ${insights?.topCategory || 'N/A'}`, 150, 72);

    // Table
    const tableColumn = ['ID', 'Specification', 'Value (INR)', 'Entry Date', 'Sector', 'Channel'];
    const tableRows = expenses.map((exp, index) => [
      (index + 1).toString().padStart(3, '0'),
      exp.title,
      exp.amount.toLocaleString(),
      new Date(exp.date).toLocaleDateString('en-GB'),
      exp.category || 'Uncategorized',
      exp.paymentMode || 'Cash'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'striped',
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 5
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244] // Green-50
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' }
      },
      margin: { top: 20 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Executive Audit Log | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('Strictly Confidential - Internal Enterprise Use Only', 105, 290, { align: 'center' });
    }

    doc.save(`finpulse_ledger_audit_${dateStr}.pdf`);
    notify('Enterprise PDF Ledger generated successfully', 'success');
  };

  const analytics = useMemo(() => {
    if (expenses.length === 0) return { avgMonthly: 0, totalExpenses: 0, monthlyTotals: [], categoryTotals: {}, paymentTotals: {} };
    const monthlyTotals = Array(12).fill(0);
    const categoryTotals = {};
    const paymentTotals = {};
    let totalExpenses = 0;
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const month = date.getMonth();
      monthlyTotals[month] += expense.amount;
      totalExpenses += expense.amount;
      const cat = expense.category || 'Others';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + expense.amount;
      const mode = expense.paymentMode || 'Cash';
      paymentTotals[mode] = (paymentTotals[mode] || 0) + expense.amount;
    });
    const monthsWithExpenses = monthlyTotals.filter(total => total > 0).length;
    const avgMonthly = monthsWithExpenses > 0 ? totalExpenses / monthsWithExpenses : 0;
    return { avgMonthly, totalExpenses, monthlyTotals, categoryTotals, paymentTotals };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = filterCategory === 'All' || e.category === filterCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        const valA = sortBy === 'date' ? new Date(a.date).getTime() : a.amount;
        const valB = sortBy === 'date' ? new Date(b.date).getTime() : b.amount;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [expenses, searchQuery, filterCategory, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const dashboardCharts = {
    pie: {
      labels: Object.keys(analytics.categoryTotals),
      datasets: [{
        data: Object.values(analytics.categoryTotals),
        backgroundColor: ['#16A34A', '#22C55E', '#EAB308', '#3B82F6', '#EF4444', '#0EA5E9', '#64748B'],
        borderWidth: 0,
        hoverOffset: 15
      }]
    },
    line: {
      labels: [...new Set(expenses.slice(0, 15).map(e => new Date(e.date).toLocaleDateString()))].reverse(),
      datasets: [{
        label: 'Capital Volume',
        data: expenses.slice(0, 15).map(e => e.amount).reverse(),
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.05)',
        fill: true,
        tension: 0.5,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#16A34A',
        pointBorderColor: '#fff',
      }]
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-1000">

      {/* Header with Unified Brand & Glass Tokens */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sticky top-0 bg-[var(--background)]/80 backdrop-blur-xl z-30 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 border-b border-[var(--border)]/50">
        <div className="flex items-center justify-between lg:justify-start gap-4">
          <div className="lg:hidden w-12" /> {/* Spacer for mobile menu trigger */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--foreground)] flex items-center gap-3">
              {activeTab === 'dashboard' && <><div className="hidden sm:block w-2 h-8 bg-green-600 rounded-full" /> Executive Command</>}
              {activeTab === 'expenses' && <><div className="hidden sm:block w-2 h-8 bg-green-600 rounded-full" /> Portfolio Ledger</>}
              {activeTab === 'analytics' && <><div className="hidden sm:block w-2 h-8 bg-blue-500 rounded-full" /> Data Analytics</>}
              {activeTab === 'insights' && <><div className="hidden sm:block w-2 h-8 bg-amber-500 rounded-full" /> Workspace Intelligence</>}
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mt-1 sm:mt-2">
              {activeTab === 'insights' ? 'Portfolio Audit Node' : `Enterprise Fiscal Period: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative group flex-1 lg:w-80">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query Audit Logs..."
              className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-3.5 bg-green-100/30 border-2 border-transparent rounded-xl sm:rounded-2xl outline-none focus:ring-4 focus:ring-green-600/10 focus:border-green-600 transition-all text-sm font-bold shadow-inner"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700 text-white p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-xl shadow-green-600/30 active:scale-90 transition-all group shrink-0"
          >
            {showAddForm ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden mb-10"
          >
            <ExpenseFormComponent
              onAdd={(e) => { addExpense(e); setShowAddForm(false); }}
              categories={categories}
              onAddCategory={addCustomCategory}
              onClose={() => setShowAddForm(false)}
              notify={notify}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 sm:space-y-10">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              whileHover={{ y: -8 }}
              className="enterprise-card kpi-card-glow p-6 sm:p-8 bg-gradient-to-br from-[var(--card)] to-green-50 border-b-4 border-b-green-600 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-label">Gross Expenditure</p>
                  <h4 className="text-2xl sm:text-4xl kpi-number font-mono flex items-center gap-1">
                    <span className="text-green-600 font-bold">₹</span>
                    {analytics.totalExpenses.toLocaleString()}
                  </h4>
                  {insights?.monthComparison && (
                    <div className={cn("px-2.5 py-1 rounded-lg text-[9px] font-bold inline-flex items-center gap-1.5", insights.monthComparison.percent > 0 ? "bg-rose-100 text-rose-600" : "bg-green-100 text-green-700 ml-auto")}>
                      {insights.monthComparison.percent > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(insights.monthComparison.percent).toFixed(1)}% PERIOD VARIANCE
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 bg-green-600/10 rounded-2xl">
                  <Wallet className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              whileHover={{ y: -8 }}
              className="enterprise-card kpi-card-glow p-6 sm:p-8 bg-gradient-to-br from-[var(--card)] to-green-50 border-b-4 border-b-green-500 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-label">Liquidity Average</p>
                  <h4 className="text-2xl sm:text-4xl kpi-number font-mono flex items-center gap-1">
                    <span className="text-teal-500 font-bold">₹</span>
                    {Math.round(analytics.avgMonthly).toLocaleString()}
                  </h4>
                  <div className="px-2.5 py-1 rounded-lg text-[9px] font-bold inline-flex items-center gap-1.5 bg-teal-100 text-teal-600">
                    OPERATIONAL STABILITY
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-green-500/10 rounded-2xl">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              whileHover={{ y: -8 }}
              className="enterprise-card kpi-card-glow p-6 sm:p-8 bg-gradient-to-br from-[var(--card)] to-blue-50/20 border-b-4 border-b-blue-500 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-label">Daily Burn Rate</p>
                  <h4 className="text-2xl sm:text-4xl kpi-number font-mono flex items-center gap-1">
                    <span className="text-blue-500 font-bold">₹</span>
                    {insights ? Math.round(insights.avgDailySpend).toLocaleString() : '--'}
                  </h4>
                  <div className="px-2.5 py-1 rounded-lg text-[9px] font-bold inline-flex items-center gap-1.5 bg-blue-100 text-blue-600">
                    NOMINAL FLOW
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-blue-500/10 rounded-2xl">
                  <Calculator className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              whileHover={{ y: -8 }}
              className="enterprise-card kpi-card-glow p-6 sm:p-8 bg-gradient-to-br from-[var(--card)] to-slate-100 border-b-4 border-b-slate-400 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-label">Logged Events</p>
                  <h4 className="text-2xl sm:text-4xl kpi-number font-mono">{expenses.length}</h4>
                  <div className="px-2.5 py-1 rounded-lg text-[9px] font-bold inline-flex items-center gap-1.5 bg-slate-100 text-slate-600">
                    FULLY SYNCHRONIZED
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-slate-500/10 rounded-2xl">
                  <History className="h-6 w-6 sm:h-7 sm:w-7 text-slate-600" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 enterprise-card p-6 sm:p-10 bg-gradient-to-br from-white to-slate-50 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-8 sm:mb-10">
                <h3 className="text-label text-green-600">Dynamic Capital Outflow Trend</h3>
                <div className="px-3 py-1 bg-green-600/10 rounded-full text-[9px] font-bold text-green-600">REALTIME DATA</div>
              </div>
              <div className="h-72 sm:h-96">
                <Line data={dashboardCharts.line} options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(0,0,0,0.03)' },
                      ticks: { color: '#64748b', font: { family: 'JetBrains Mono', weight: 'bold' } }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: '#64748b', font: { family: 'JetBrains Mono', weight: 'bold' } }
                    }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }} />
              </div>
            </div>
            <div className="enterprise-card p-6 sm:p-10 bg-[var(--card)]">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-label text-amber-600">Asset Sector Allocation</h3>
                <PieChart className="h-5 w-5 text-amber-400" />
              </div>
              <div className="h-96">
                <Doughnut data={dashboardCharts.pie} options={{
                  maintainAspectRatio: false,
                  cutout: '80%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#0f172a',
                        font: { weight: 'bold', size: 10 },
                        usePointStyle: true,
                        padding: 25
                      }
                    }
                  }
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div className="space-y-6 animate-in slide-in-from-right-10 duration-700">
          <div className="enterprise-card bg-white border border-slate-200">
            {/* Unified Sticky Header Section */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
              {/* Filters Bar */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-600 rounded-lg">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Audit Filters</span>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-white border border-green-200 rounded-lg text-sm font-medium outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600 focus:ring-offset-1 transition-colors cursor-pointer"
                  >
                    <option value="All">All Operations</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Grid Headers - Hidden on Mobile */}
              <div className="hidden lg:flex px-6 py-3 items-center bg-slate-50 border-y border-slate-200">
                <div className="flex-1 text-xs font-medium text-slate-500 uppercase">Operation Unit</div>
                <div
                  className="w-48 text-xs font-medium text-slate-500 uppercase cursor-pointer hover:text-green-600 transition-colors flex items-center gap-1"
                  onClick={() => toggleSort('amount')}
                >
                  Capital <ArrowUpDown className="h-3 w-3" />
                </div>
                <div
                  className="w-48 text-xs font-medium text-slate-500 uppercase cursor-pointer hover:text-green-600 transition-colors flex items-center gap-1"
                  onClick={() => toggleSort('date')}
                >
                  Date <ArrowUpDown className="h-3 w-3" />
                </div>
                <div className="w-48 text-xs font-medium text-slate-500 uppercase">Flow</div>
                <div className="w-32 text-right text-xs font-medium text-slate-500 uppercase">Control</div>
              </div>
            </div>

            {/* Grid Body */}
            <div className="divide-y divide-slate-100 overflow-hidden">
              <AnimatePresence>
                {filteredExpenses.map((exp) => (
                  <motion.div
                    key={exp._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="px-6 py-4 flex items-center group hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-full">
                      {editingId === exp._id ? (
                        <div className="bg-[var(--card)] p-4 sm:p-6 rounded-2xl border-2 border-green-600/30 shadow-2xl space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div className="lg:col-span-2 space-y-2">
                              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Specification</label>
                              <input
                                name="title"
                                value={editedExpense.title}
                                onChange={handleEditChange}
                                className="input-field"
                                placeholder="Transaction Title"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Value (₹)</label>
                              <input
                                name="amount"
                                type="number"
                                value={editedExpense.amount}
                                onChange={handleEditChange}
                                className="input-field font-black"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Date</label>
                              <input
                                name="date"
                                type="date"
                                value={editedExpense.date}
                                onChange={handleEditChange}
                                className="input-field font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Sector</label>
                              <select
                                name="category"
                                value={editedExpense.category}
                                onChange={handleEditChange}
                                className="input-field font-bold cursor-pointer"
                              >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Channel</label>
                              <select
                                name="paymentMode"
                                value={editedExpense.paymentMode}
                                onChange={handleEditChange}
                                className="input-field font-bold cursor-pointer"
                              >
                                {['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map(mode => (
                                  <option key={mode} value={mode}>{mode}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-end gap-3">
                              <button onClick={() => saveEdit(exp._id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Save className="h-4 w-4" /> Commit
                              </button>
                              <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                                <X className="h-4 w-4" /> Abort
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-0">
                          {/* Unit Title & Icon */}
                          <div className="flex-1 flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 flex-shrink-0 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                              <Tag className="h-5 w-5 text-slate-400 group-hover:text-green-600" />
                            </div>
                            <div className="truncate">
                              <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                                <span>{exp.title}</span>
                                {exp.isAIComputed && <Sparkles className="h-3.5 w-3.5 text-green-600" />}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                                  {exp.category || 'Uncategorized'}
                                </span>
                                <span className="lg:hidden text-[10px] font-mono font-bold text-slate-400">
                                  {new Date(exp.date).toLocaleDateString('en-GB')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Stats Grid */}
                          <div className="flex flex-row lg:items-center justify-between lg:justify-start gap-4 lg:gap-0 mt-2 lg:mt-0">
                            <div className="lg:w-48 text-lg lg:text-sm font-black font-mono text-slate-900">
                              ₹{exp.amount.toLocaleString()}
                            </div>

                            <div className="hidden lg:flex w-48 items-center gap-2 text-xs text-slate-500">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span className="font-mono">{new Date(exp.date).toLocaleDateString('en-GB')}</span>
                            </div>

                            <div className="lg:w-48 flex items-center gap-2">
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                                exp.paymentMode === 'UPI' ? "bg-purple-100 text-purple-700" :
                                  exp.paymentMode === 'Credit Card' ? "bg-blue-100 text-blue-700" :
                                    exp.paymentMode === 'Net Banking' ? "bg-green-100 text-green-700" :
                                      "bg-slate-100 text-slate-600"
                              )}>
                                {exp.paymentMode || 'Cash'}
                              </span>
                              {exp.isRecurring && (
                                <div className="hidden sm:flex px-2 py-0.5 rounded-md bg-indigo-50 text-[9px] font-bold text-indigo-600 items-center gap-1 uppercase tracking-tighter">
                                  <Repeat className="h-3 w-3" /> Recurring
                                </div>
                              )}
                            </div>

                            <div className="lg:w-32 flex items-center justify-end gap-1 sm:gap-2">
                              <button
                                onClick={() => startEditing(exp)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-green-600 hover:bg-green-50 transition-all active:scale-90"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => deleteExpense(exp._id)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {isLoading && (
              <div className="p-24 text-center space-y-5">
                <div className="h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-black uppercase tracking-[0.4em] text-[10px] text-slate-400">Syncing Master Ledger...</p>
              </div>
            )}

            {!isLoading && filteredExpenses.length === 0 && (
              <div className="p-24 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
                Zero Entry Records Found
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-bottom-10 duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="enterprise-card p-6 sm:p-10 bg-gradient-to-br from-[var(--card)] to-blue-50/20">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-8 sm:mb-10 flex items-center gap-3">
                <PieChart className="h-4 w-4" /> Sector Diversification Audit
              </h3>
              <div className="h-72 sm:h-96">
                <Pie data={dashboardCharts.pie} options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'JetBrains Mono', weight: 'bold', size: 10 }, padding: 25, color: '#64748b' } }
                  }
                }} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="enterprise-card p-6 sm:p-10 bg-gradient-to-br from-[var(--card)] to-green-50">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-8 sm:mb-10 flex items-center gap-3">
                <History className="h-4 w-4" /> Velocity of Settlement
              </h3>
              <div className="h-72 sm:h-96">
                <Doughnut
                  data={{
                    labels: Object.keys(analytics.paymentTotals),
                    datasets: [{
                      data: Object.values(analytics.paymentTotals),
                      backgroundColor: ['#16A34A', '#22C55E', '#EAB308', '#3B82F6', '#0EA5E9'],
                      borderWidth: 0,
                      cutout: '75%'
                    }]
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { font: { family: 'JetBrains Mono', weight: 'bold', size: 10 }, padding: 25, color: '#64748b' } }
                    }
                  }}
                />
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="enterprise-card p-6 sm:p-10 border-t-4 border-t-green-600">
            <h3 className="text-label text-slate-500 mb-8 sm:mb-12">Quarterly Capital Transformation Index</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-12">
              {analytics.monthlyTotals.map((total, index) => {
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                if (total === 0) return null;
                return (
                  <div key={index} className="space-y-4 sm:space-y-5 group">
                    <div className="flex justify-between items-end">
                      <span className="text-label text-slate-400 group-hover:text-green-600 transition-colors uppercase">{months[index]} CYCLE</span>
                      <span className="font-mono text-lg sm:text-xl font-bold text-slate-900">₹{total.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner border border-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(total / Math.max(...analytics.monthlyTotals)) * 100}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 h-full shadow-[0_0_15px_rgba(22,163,74,0.3)] relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )
      }

      {/* INSIGHTS TAB */}
      {activeTab === 'insights' && (
        <div className="space-y-6 sm:space-y-10 animate-in zoom-in-95 duration-1000 px-1 sm:px-0">
          {insights ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="enterprise-card p-6 flex flex-row items-center gap-6 border-l-4 border-l-rose-500"
              >
                <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className={cn("h-6 w-6", insights.monthComparison.percent > 0 ? "text-rose-600" : "text-green-600")} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wide">Variance Audit</h4>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Capital utilization shifted by <span className={insights.monthComparison.percent > 0 ? "text-rose-600" : "text-green-600"}>{Math.abs(insights.monthComparison.percent).toFixed(1)}%</span> vs prev cycle.
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono font-black uppercase tracking-tighter">Baseline: ₹{insights.monthComparison.last.toLocaleString()}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="enterprise-card p-6 flex flex-row items-center gap-6 border-l-4 border-l-green-600"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wide">Sector Dominance</h4>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    High-volume focus detected in <span className="text-green-600 font-bold">"{insights.topCategory}"</span>.
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono font-black uppercase tracking-tighter">Volume: ₹{insights.topCategoryAmount?.toLocaleString() || 0}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="enterprise-card p-6 flex flex-row items-center gap-6 border-l-4 border-l-blue-500"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wide">Equity Retention</h4>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {insights.savingsAmount > 0 ? (
                      <>Liberated <span className="text-green-600 font-bold">₹{insights.savingsAmount.toLocaleString()}</span> in retained capital.</>
                    ) : (
                      <>Current period shows aggressive capital outflow.</>
                    )}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: 'spring', damping: 20 }}
                className="md:col-span-2 xl:col-span-3 enterprise-card p-6 sm:p-12 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(22,163,74,0.1)] bg-white border-slate-100"
              >
                <div className="absolute right-0 top-0 w-96 h-96 bg-green-600/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-green-500/30 transition-all duration-1000" />
                <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -ml-48 -mb-48 group-hover:bg-blue-500/25 transition-all duration-1000" />

                <div className="relative z-10 space-y-6 sm:space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 sm:p-3 bg-green-500/20 rounded-2xl backdrop-blur-3xl border border-green-500/30">
                      <BrainCircuit className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-green-400">Insight Intelligence Core</h4>
                      <p className="text-[8px] sm:text-[10px] font-medium text-green-500/60 tracking-widest uppercase mt-1">Autonomous Fiscal Strategy Audit</p>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <p className="text-xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
                      Average burn velocity: <span className="text-green-600 font-mono">₹{Math.round(insights.avgDailySpend).toLocaleString()}/day</span>.
                    </p>
                    <p className="text-sm sm:text-xl lg:text-2xl font-bold text-slate-600 leading-relaxed tracking-wide">
                      Strategic Recommendation: Optimization of <span className="text-blue-600 font-black underline decoration-blue-400/50 underline-offset-8">"{insights.topCategory}"</span> by 15% would liberate approximately <span className="text-green-600 font-black font-mono">₹{Math.round((insights.topCategoryAmount || 0) * 0.15).toLocaleString()}</span> in net monthly equity.
                    </p>
                  </div>

                  <div className="pt-6 sm:pt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-t border-slate-100/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 tracking-widest mb-3 uppercase">Core Confidence Index</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                          <motion.div
                            key={i}
                            initial={{ scaleY: 0.5 }}
                            animate={{ scaleY: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                            className={`h-2.5 w-3.5 sm:h-3 sm:w-4 rounded-sm ${i <= 6 ? 'bg-green-600 shadow-[0_0_10px_rgba(22,163,74,0.5)]' : 'bg-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="hidden sm:block h-10 w-px bg-slate-200" />
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                      <p className="text-[10px] sm:text-[11px] font-black text-green-600 tracking-widest uppercase">Status: Decisioning Optimal</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="p-32 text-center space-y-8 border-2 border-dashed border-green-600/10 rounded-[3rem] bg-slate-50/50">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-t-2 border-r-2 border-green-600/40"
                />
                <BrainCircuit className="absolute inset-0 m-auto h-12 w-12 text-green-600/40 animate-pulse" />
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.4em] text-[11px] text-slate-400 mb-2">Analyzing Financial Patterns</p>
                <div className="h-1 w-48 bg-slate-100 rounded-full mx-auto overflow-hidden">
                  <motion.div
                    animate={{ x: [-192, 192] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full w-full bg-gradient-to-r from-transparent via-green-600 to-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast System */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="fixed bottom-10 right-10 z-50"
          >
            <div className={cn(
              "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl transition-all",
              error.type === 'success' ? "bg-green-950/90 text-white border-green-600/30 shadow-green-600/20" :
                error.type === 'error' ? "bg-rose-950/90 text-white border-rose-500/30 shadow-rose-500/20" :
                  "bg-slate-900/90 text-white border-blue-500/30 shadow-blue-500/20"
            )}>
              <div className={cn(
                "p-2 rounded-xl bg-opacity-20",
                error.type === 'success' ? "bg-green-600 text-green-400" :
                  error.type === 'error' ? "bg-rose-500 text-rose-400" :
                    "bg-blue-500 text-blue-400"
              )}>
                {error.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                {error.type === 'error' && <AlertCircle className="h-5 w-5" />}
                {error.type === 'info' && <Sparkles className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest leading-none mb-1",
                  error.type === 'success' ? "text-green-400" :
                    error.type === 'error' ? "text-rose-400" :
                      "text-blue-400"
                )}>
                  {error.type === 'success' ? 'Confirmed' : error.type === 'error' ? 'Security Alert' : 'Insight Echo'}
                </p>
                <p className="text-sm font-medium tracking-tight text-slate-100">{error.message}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpenseList;
