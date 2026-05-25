import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, LogIn, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { navigate } from '../lib/router.js';
import Logo from './Logo.js';

interface AgentLoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function AgentLoginPage({ onLoginSuccess }: AgentLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Harap masukkan alamat email dan kata sandi Anda.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Autentikasi gagal. Silakan coba lagi.');
      } else {
        // Success login! Tell callback and redirect to dashboard
        onLoginSuccess(data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung dengan server autentikasi.');
      console.error('Login error: ', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#09090B] min-h-screen text-white flex items-center justify-center p-4 md:p-8 relative font-sans overflow-hidden">
      {/* Dynamic ambient vector glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-brand-gold/5 blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 h-[450px] w-[500px] rounded-full bg-[#B33A3A]/5 blur-[120px] -z-10" />
      
      {/* Premium subtle alignment grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40 pointer-events-none -z-20" />

      <div className="w-full max-w-md relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-2xl border-2 border-zinc-800 bg-[#121215] p-8 shadow-2xl relative"
        >
          {/* Top aesthetic accent band */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-gold via-white to-[#B33A3A] rounded-t-2xl" />

          {/* Logo Brand Header Block */}
          <div className="flex flex-col items-center text-center mb-8">
            <Logo size="lg" withWhiteBg={true} className="mb-5 shadow-xl hover:scale-102 transition-transform duration-300" />
            
            <div className="inline-flex items-center space-x-2 bg-zinc-950 border border-zinc-805 border-zinc-800 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-brand-gold uppercase">
              <span className="h-1.5 w-1.5 bg-[#B33A3A] rounded-full animate-ping shrink-0" />
              <span>Internal Agent Portal</span>
            </div>
            
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed max-w-xs">
              Gunakan kredensial resmi Anda untuk mengakses sistem database premium.
            </p>
          </div>

          {/* High-visibility contrast form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Email Group */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="agent-email" className="text-xs font-black uppercase tracking-wider text-zinc-300 font-sans">
                  Email Karyawan
                </label>
                <span className="text-[10px] text-zinc-500 font-mono font-bold">REQUIRED</span>
              </div>
              <div className="relative group/input">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 group-focus-within/input:text-brand-gold transition-colors">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  id="agent-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@primeproperty.com"
                  className="w-full rounded-xl border-2 border-zinc-700 bg-zinc-950/90 pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 font-sans transition-all focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/15"
                />
              </div>
            </div>

            {/* Input Password Group */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="agent-password" className="text-xs font-black uppercase tracking-wider text-zinc-300 font-sans">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-zinc-500 font-mono font-bold">REQUIRED</span>
              </div>
              <div className="relative group/input">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 group-focus-within/input:text-brand-gold transition-colors">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="agent-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border-2 border-zinc-700 bg-zinc-950/90 pl-11 pr-11 py-3 text-sm text-white placeholder-zinc-500 font-sans transition-all focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Premium Error alert if credentials are invalid */}
            {errorMsg && (
              <div className="rounded-xl bg-red-950/40 border-2 border-[#B33A3A]/80 p-4 text-xs text-red-100 flex items-start space-x-3 animate-headshake">
                <ShieldAlert className="h-5 w-5 shrink-0 text-[#B33A3A] mt-0.5" />
                <span className="leading-relaxed font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Distinct Submit action representing clear division from page container */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-brand-gold to-[#B33A3A] text-white font-black tracking-widest font-sans text-xs py-4 px-5 shadow-2xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2.5 mt-6 cursor-pointer"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-4.5 w-4.5" />
                  <span className="uppercase text-shadow">MASUK SISTEM DATABASE</span>
                </>
              )}
            </motion.button>

          </form>

          {/* Aesthetic footer of the card */}
          <div className="mt-8 border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-zinc-400 hover:text-brand-gold transition-colors font-semibold cursor-pointer flex items-center space-x-1"
            >
              <span>&larr;</span> <span>Kembali ke Landing</span>
            </button>
            
            <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 font-mono tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>TLS ENCRYPTED SECURE</span>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
