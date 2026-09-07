import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

import { setAuthSession } from './utils/auth';

import { API_BASE_URL as baseURL } from './config';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${baseURL}/login`, {
        identifier: username, // Send as identifier (can be email or username)
        password,
      });

      const token = res.data.token;
      setAuthSession(token, res.data.user);
      onLogin();
      navigate('/');
    } catch (err) {
      alert('Authentication failed: ' + (err.response?.data?.error || 'System access denied'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-green-600/5 rounded-full blur-[80px] sm:blur-[100px] -mr-32 -mt-32 sm:-mr-64 sm:-mt-64" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-600/5 rounded-full blur-[80px] sm:blur-[100px] -ml-32 -mb-32 sm:-ml-64 sm:-mb-64" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="enterprise-card p-6 sm:p-10 w-full max-w-md relative z-10 bg-white/50 backdrop-blur-xl shadow-2xl border-2 border-white/20"
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <motion.div
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: 3, scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-green-600 to-green-400 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl shadow-green-600/30"
          >
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] mb-1 sm:mb-2 uppercase tracking-tighter leading-none">FinPulse Access</h2>
          <p className="text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Secure Enterprise Gateway</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Email / Operative ID"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 sm:py-4 bg-white border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-green-600 focus:bg-white transition-all outline-none font-bold text-sm shadow-inner"
              />
            </div>

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
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs text-white transition-all shadow-xl sm:shadow-2xl flex items-center justify-center gap-2 sm:gap-3 ${isLoading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-700 to-green-500 shadow-green-600/20 active:translate-y-0.5'
              }`}
          >
            {isLoading ? 'Verifying Identity......' : (
              <>Authorize Session <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </form>

        <div className="mt-8 sm:mt-10 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6 sm:mb-8" />
          <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-none">
            New Operative?{' '}
            <Link
              to="/register"
              className="text-green-600 font-black hover:text-green-500 transition-colors inline-block"
            >
              Request Enrollment
            </Link>
          </p>
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Demo Credentials</span>
            <div className="flex items-center gap-6 sm:gap-8 px-6 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">ID</span>
                <span className="text-sm font-mono font-black text-green-600 leading-none">Vaii</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Key</span>
                <span className="text-sm font-mono font-black text-blue-600 leading-none">123456</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
