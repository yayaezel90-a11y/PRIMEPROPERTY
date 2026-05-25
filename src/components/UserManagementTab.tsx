import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, KeyRound, ShieldAlert, ShieldCheck, CheckCircle2, Lock, Mail, Trash2, Shield, UserX, UserCheck } from 'lucide-react';
import { User } from '../types.js';

export default function UserManagementTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Register Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  // Reset Password Form State
  const [targetResetUser, setTargetResetUser] = useState<User | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const getAuthHeaders = (extra: Record<string, string> = {}) => {
    const localUserStr = localStorage.getItem('prime_agent_user');
    const headers: Record<string, string> = { ...extra };
    if (localUserStr) {
      try {
        const user = JSON.parse(localUserStr);
        headers['Authorization'] = `Bearer ${user.id}`;
        headers['x-session-token'] = user.id;
      } catch (e) {
        console.error(e);
      }
    }
    return headers;
  };

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users', { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load users list:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!newEmail.trim() || !newPassword.trim()) {
      setRegisterError('Email dan password wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setRegisterError('Kata sandi/password harus minimal 6 karakter.');
      return;
    }

    setRegisterSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ email: newEmail, password: newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || 'Gagal meregistrasi akun admin baru.');
      } else {
        setRegisterSuccess(`Akun admin ${data.email} berhasil didaftarkan!`);
        setNewEmail('');
        setNewPassword('');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      setRegisterError('Masalah koneksi terdeteksi.');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const handleToggleActive = async (userId: string, currentEmail: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/toggle`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal mengubah status aktif user.');
      } else {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      alert('Masalah koneksi terdeteksi.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!targetResetUser) return;

    if (!newResetPassword || newResetPassword.length < 6) {
      setResetError('Password baru harus terdiri dari minimal 6 karakter.');
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await fetch(`/api/users/${targetResetUser.id}/reset`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ newPassword: newResetPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || 'Gagal mereset kata sandi.');
      } else {
        setResetSuccess(`Kata sandi untuk ${targetResetUser.email} berhasil direset!`);
        setNewResetPassword('');
        setTimeout(() => {
          setTargetResetUser(null);
          setResetSuccess('');
        }, 2200);
      }
    } catch (err) {
      console.error(err);
      setResetError('Masalah koneksi terdeteksi.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const superadminsCount = users.filter(u => u.role === 'superadmin').length;
  const activeAdminsCount = users.filter(u => u.role === 'admin' && u.isActive).length;
  const deactivatedCount = users.filter(u => !u.isActive).length;

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Upper description band with dynamic counter cards */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#121215] border border-zinc-850 p-6 rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-[#C9A961] uppercase tracking-wider flex items-center space-x-2.5">
            <Users className="h-5 w-5 text-brand-gold shrink-0" />
            <span>Manajemen Akun Agen & Admin</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Sistem pengawasan kredensial primer. Daftarkan petugas, koordinasikan role admin, bekukan status sistem jika terjadi penyalahgunaan, atau selesaikan kendala login lupa kata sandi.
          </p>
        </div>

        {/* Real-time statistics counters */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Super</span>
            <span className="text-base font-black text-brand-gold">{superadminsCount} Account</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-emerald-500 block uppercase tracking-wider">Active</span>
            <span className="text-base font-black text-zinc-200">{activeAdminsCount} Agent</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-rose-500 block uppercase tracking-wider">Banned</span>
            <span className="text-base font-black text-rose-400">{deactivatedCount} Banned</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE USER ACCOUNTS LIST */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C9A961] font-mono">Daftar Kredensial Pengguna</h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Secure TLS Verified</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16 text-zinc-400 text-xs bg-[#121215] border border-zinc-850 rounded-2xl">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-gold border-t-transparent mr-3" />
              <span>Menghubungkan ke direktori admin...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 p-12 text-center text-zinc-500 text-xs">
              Belum ada petugas terdaftar dalam database sistem.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-850 bg-[#121215] shadow-xl">
              <div className="divide-y divide-zinc-900">
                {users.map((u) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={u.id} 
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Brand themed avatar with gold outline */}
                      <div className="h-10 w-10 shrink-0 rounded-xl border border-brand-gold/20 bg-zinc-950 flex items-center justify-center text-brand-gold text-xs font-black uppercase tracking-wider font-mono">
                        {u.email.substring(0, 2)}
                      </div>

                      <div className="text-left space-y-1">
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                          <p className="text-sm font-black text-zinc-100">{u.email}</p>
                          <span className={`rounded-lg px-2 py-0.5 text-[8px] font-mono tracking-widest font-black uppercase border ${
                            u.role === 'superadmin' 
                              ? 'bg-brand-gold/15 text-[#C9A961] border-brand-gold/20' 
                              : 'bg-zinc-900 text-zinc-400 border-zinc-805 border-zinc-800'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`flex items-center space-x-1 text-[10px] font-mono font-bold ${
                            u.isActive ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            <span>{u.isActive ? 'STATUS AKTIF' : 'STATUS DIBEKUKAN'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Action buttons with clean separation */}
                    <div className="flex items-center space-x-2.5 sm:self-center">
                      {u.role !== 'superadmin' ? (
                        <>
                          {/* Toggle Active btn */}
                          <button
                            onClick={() => handleToggleActive(u.id, u.email)}
                            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer duration-150 flex items-center space-x-1.5 ${
                              u.isActive 
                                ? 'border border-[#B33A3A]/40 bg-[#B33A3A]/5 text-rose-400 hover:bg-[#B33A3A] hover:text-white' 
                                : 'border border-emerald-500/40 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                            }`}
                          >
                            {u.isActive ? (
                              <>
                                <UserX className="h-3.5 w-3.5 shrink-0" />
                                <span>Bekukan Akun</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 shrink-0" />
                                <span>Aktifkan Akun</span>
                              </>
                            )}
                          </button>

                          {/* Trigger Password Reset dialog */}
                          <button
                            onClick={() => {
                              setTargetResetUser(u);
                              setResetError('');
                              setResetSuccess('');
                            }}
                            className="rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-white px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 duration-150 cursor-pointer"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            <span>Ubah Sandi</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-600 block px-3 py-1.5 rounded-lg border border-zinc-900 bg-zinc-950 font-bold tracking-widest uppercase">
                          ★ OWNER SECURE KEY
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REGISTER NEW USER BLOCK */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-gold font-mono">Registrasi Baru</h3>
          
          <div className="bg-[#121215] rounded-2xl border-2 border-zinc-850 p-6 space-y-5">
            <div className="flex items-center space-x-3 border-b border-zinc-850 pb-4">
              <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-xl border border-brand-gold/20">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wide">Petugas/Admin Baru</h3>
                <p className="text-[10px] text-zinc-500 font-mono">ACCOUNT REGISTER ENGINE</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Alamat Surat Elektronik (Surel)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 group-focus-within:text-[#C9A961] transition-colors">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nama@primeproperty.com"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 font-sans text-xs text-white pl-10 pr-4 py-3 focus:border-brand-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Kata Sandi Sementara (Min. 6 Kar)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 group-focus-within:text-[#C9A961] transition-colors">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter unik"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white pl-10 pr-4 py-3 focus:border-brand-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {registerError && (
                <div className="rounded-xl bg-red-950/40 border-2 border-[#B33A3A] p-4 text-xs text-rose-300 flex items-start space-x-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{registerError}</span>
                </div>
              )}

              {registerSuccess && (
                <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-4 text-xs text-emerald-300 flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{registerSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={registerSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-brand-gold to-[#bda05d] py-3.5 px-4 font-black text-zinc-950 hover:brightness-110 text-xs uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-gold/5"
              >
                {registerSubmitting ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Petugas'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Reset Password Modal Overlay Dialog */}
      <AnimatePresence>
        {targetResetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setTargetResetUser(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border-2 border-brand-gold/30 bg-[#121215] p-6 shadow-2xl text-white font-sans text-left space-y-4"
            >
              <div className="flex items-center space-x-2.5 border-b border-zinc-850 pb-3">
                <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg border border-brand-gold/20">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-100 uppercase tracking-wider text-xs">Reset Sandi Darurat</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">SECURE BYPASS UTILITY</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Buat kata sandi baru untuk akses administrator: <br />
                <span className="text-brand-gold font-bold">{targetResetUser.email}</span>
              </p>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                    Sandi Baru (Min. 6 Kar)
                  </label>
                  <input
                    type="password"
                    required
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Kunci sandi baru agen"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
                  />
                </div>

                {resetError && (
                  <div className="rounded-xl bg-red-950/40 border border-[#B33A3A] p-4 text-xs text-rose-300">
                    {resetError}
                  </div>
                )}

                {resetSuccess && (
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-4 text-xs text-emerald-300">
                    {resetSuccess}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetResetUser(null)}
                    className="rounded-xl border border-zinc-850 bg-transparent text-zinc-400 px-4 py-2.5 hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="rounded-xl bg-brand-gold hover:bg-[#b09355] text-zinc-950 font-black uppercase tracking-wider px-5 py-2.5 transition-colors disabled:opacity-50 text-xs cursor-pointer shadow-md"
                  >
                    {resetSubmitting ? 'Memproses...' : 'Ubah Sandi'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
