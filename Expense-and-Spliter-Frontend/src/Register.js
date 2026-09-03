import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Lock, ShieldCheck, CheckCircle, ArrowLeft } from 'lucide-react';

const baseURL = process.env.REACT_APP_BASE_URL ||
  (window.location.hostname.includes('vercel.app')
    ? 'https://expense-and-spliter-backend.onrender.com/api'
    : 'http://localhost:5000/api');

const Register = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Security keys do not match. Authorization compromised.');
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${baseURL}/register`, { username, name, email, password });
      setShowSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      alert('Enrollment failed: ' + (err.response?.data?.error || 'System rejection'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-green-600/5 rounded-full blur-[80px] sm:blur-[120px] -ml-32 -mt-32 sm:-ml-64 sm:-mt-64" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-blue-600/5 rounded-full blur-[80px] sm:blur-[120px] -mr-32 -mb-32 sm:-mr-64 sm:-mb-64" />

      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="enterprise-card p-8 sm:p-12 w-full max-w-md text-center relative z-10 bg-white/50 backdrop-blur-xl shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-green-600 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl shadow-green-600/40"
            >
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] mb-2 uppercase tracking-tighter">Enrollment Verified</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Digital Operative ID Created Successfully</p>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, ease: "linear" }}
                className="h-full bg-green-600"
              />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-green-600 mt-4 leading-none">Redirecting to Authorization Gateway...</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5 }}
            className="enterprise-card p-6 sm:p-10 w-full max-w-lg relative z-10 bg-white/50 backdrop-blur-xl shadow-2xl border-2 border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
              <motion.div
                initial={{ rotate: 15, scale: 0 }}
                animate={{ rotate: -3, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-green-700 to-green-500 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl shadow-green-600/30"
              >
                <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] mb-1 sm:mb-2 uppercase tracking-tighter leading-none">Operative Enrollment</h2>
              <p className="text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Establish New Enterprise Ledger Account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 sm:py-4 bg-white border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-sm shadow-inner"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 sm:py-4 bg-white border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-sm shadow-inner"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Establish Operative ID (Username)"
                    value={username}
                    required
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 sm:py-4 bg-white border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-sm shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="Security Key"
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-6 py-3.5 sm:py-4 bg-white border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-sm shadow-inner"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="Verify Key"
                      value={confirmPassword}
                      required
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-12 pr-6 py-3.5 sm:py-4 bg-white border-2 rounded-xl sm:rounded-2xl transition-all outline-none font-bold text-sm shadow-inner ${confirmPassword && password !== confirmPassword
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-transparent focus:border-green-600'
                        }`}
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || (confirmPassword && password !== confirmPassword)}
                className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs text-white transition-all shadow-xl sm:shadow-2xl flex items-center justify-center gap-2 sm:gap-3 ${isLoading || (confirmPassword && password !== confirmPassword)
                  ? 'bg-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-green-700 to-green-500 shadow-green-600/20 active:translate-y-0.5'
                  }`}
              >
                {isLoading ? 'Processing Neural ID...' : 'Finalize Enrollment'}
              </motion.button>
            </form>

            <div className="mt-8 sm:mt-10 text-center">
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6 sm:mb-8" />
              <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 leading-none">
                Already an Operative?{' '}
                <Link
                  to="/login"
                  className="text-green-600 font-black hover:text-green-500 transition-all flex items-center gap-1 group"
                >
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Authorize Session
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
