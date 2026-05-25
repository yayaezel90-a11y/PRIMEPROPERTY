import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MessageSquare, MapPin, Send, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomorHp: '',
    pesan: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Floating Toast Notification state (AC-4.2)
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({ type: 'success', text: '' });

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastContent({ type, text });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const { nama, email, nomorHp, pesan } = formData;

    // Contact Form Validations (AC-4.2)
    if (!nama.trim() || !email.trim() || !nomorHp.trim() || !pesan.trim()) {
      setErrorMsg('Semua kolom formulir wajib diisi.');
      triggerToast('error', 'Semua kolom formulir wajib diisi.');
      setSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Format email tidak valid (contoh: nama@domain.com).');
      triggerToast('error', 'Format email tidak valid.');
      setSubmitting(false);
      return;
    }

    const phoneOnlyDigits = nomorHp.replace(/\D/g, '');
    if (phoneOnlyDigits.length < 10) {
      setErrorMsg('Nomor HP harus valid dan minimal terdiri dari 10 digit.');
      triggerToast('error', 'Nomor HP minimal harus 10 digit.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.status === 429) {
        setErrorMsg(data.error || 'Terlalu banyak mengirim pesan. Batas maksimal adalah 3 pesan per jam.');
        triggerToast('error', data.error || 'Rate limit terlampaui. Cobalah beberapa saat lagi.');
      } else if (!res.ok) {
        setErrorMsg(data.error || 'Terjadi kesalahan pada server saat mengirim pesan.');
        triggerToast('error', data.error || 'Gagal mengirim pesan.');
      } else {
        // Success Toast Text exact match: "Pesan terkirim, tim kami akan menghubungi Anda." (AC-4.2)
        const okMsg = 'Pesan terkirim, tim kami akan menghubungi Anda.';
        setSuccessMsg(okMsg);
        triggerToast('success', okMsg);
        setFormData({ nama: '', email: '', nomorHp: '', pesan: '' });
      }
    } catch (err) {
      setErrorMsg('Gagal menyambung ke server. Silakan periksa koneksi internet Anda.');
      triggerToast('error', 'Masalah koneksi terdeteksi.');
      console.error('Contact submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#1A1A1A] py-16 md:py-24 relative font-sans">
      
      {/* Toast Notification (AC-4.2) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-50 flex items-center space-x-3 rounded-xl px-6 py-4.5 shadow-2xl font-sans text-sm font-bold max-w-sm w-full mx-auto border ${
              toastContent.type === 'success' 
                ? 'bg-emerald-600 border-emerald-400 text-white' 
                : 'bg-[#B33A3A] border-red-500 text-white'
            }`}
          >
            {toastContent.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{toastContent.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title Block */}
        <div className="text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-widest text-[#C9A961] font-bold font-mono"
          >
            Hubungan Komersial
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-3xl font-extrabold tracking-tight text-[#1A1A1A] uppercase sm:text-4xl"
          >
            Hubungi Kami
          </motion.h1>
          <div className="mx-auto mt-3.5 h-1 w-16 bg-[#C9A961] rounded" />
          <p className="mt-4 text-zinc-500 text-xs max-w-xl mx-auto leading-relaxed">
            Kirim pesan kepada kami atau kunjungi kantor pemasaran operasional untuk konsultasi komersial real estate.
          </p>
        </div>

        {/* 2 Column Details & Form Segment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Column 1: Contact Detail Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div className="text-left space-y-2">
              <h2 className="text-xl font-bold text-[#C9A961] tracking-wide uppercase">Informasi Kontak Utama</h2>
              <p className="text-xs text-zinc-500 font-medium">Saluran representasi pemasaran resmi kami.</p>
            </div>

            {/* List of Details with Icons (Soft Gray cards #F5F5F5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Alamat */}
              <div className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] p-6 flex flex-col justify-between text-left shadow-xs">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C9A961]/10 border border-[#C9A961]/25 text-[#C9A961] mb-5">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Kantor Pusat</h3>
                  <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed font-sans font-medium">
                    Jalan Sudirman No. 123, Jakarta Selatan, DKI Jakarta
                  </p>
                </div>
              </div>

              {/* Telpon */}
              <div className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] p-6 flex flex-col justify-between text-left shadow-xs">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C9A961]/10 border border-[#C9A961]/25 text-[#C9A961] mb-5">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Nomor Telepon</h3>
                  <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed font-sans font-medium">
                    (021) 12345678 / Ext 440
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] p-6 flex flex-col justify-between text-left shadow-xs font-sans">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C9A961]/10 border border-[#C9A961]/25 text-[#C9A961] mb-5">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Kirim Surel</h3>
                  <a 
                    href="mailto:info@primeproperty.com"
                    className="text-xs text-[#C9A961] font-bold mt-2.5 block break-all font-mono hover:underline"
                  >
                    info@primeproperty.com
                  </a>
                </div>
              </div>

              {/* WhatsApp Link */}
              <div className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] p-6 flex flex-col justify-between text-left shadow-xs font-sans">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C9A961]/10 border border-[#C9A961]/25 text-[#C9A961] mb-5">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Layanan WhatsApp</h3>
                  <a 
                    href="https://wa.me/628123456789"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#C9A961] font-bold mt-2.5 block hover:underline"
                  >
                    wa.me/628123456789
                  </a>
                </div>
              </div>

            </div>

            {/* Google Maps iFrame */}
            <div className="rounded-2xl border border-zinc-200 overflow-hidden shadow-md bg-[#F5F5F5] h-64 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.299596041005!2d106.8456!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNyJTIDEwNsKwNTAnNDQuMiJF!5e0!3m2!1sid!2sid!4v1700000000000"
                className="absolute inset-0 w-full h-full border-0 grayscale opacity-85 hover:opacity-100 transition-opacity duration-300"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>

          {/* Column 2: Form Kontak (Soft Gray card #F5F5F5) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] p-8 md:p-10 shadow-lg space-y-6 text-left"
          >
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-wide">Formulir Hubungi</h2>
              <p className="text-xs text-zinc-500 mt-1 font-sans">Kirim berkas pertanyaan, tim kami akan merespons dengan sigap.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              {/* Name field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-650 mb-1.5 font-mono">
                  Nama Lengkap <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-lg border border-zinc-200 bg-[#FFFFFF] px-4.5 py-3 text-sm text-[#1A1A1A] placeholder-zinc-400 focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961] focus:outline-none transition-all"
                />
              </div>

              {/* Email field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-650 mb-1.5 font-mono">
                  Surel / Email <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="nama@perusahaan.com"
                  className="w-full rounded-lg border border-zinc-200 bg-[#FFFFFF] px-4.5 py-3 text-sm text-[#1A1A1A] placeholder-zinc-400 focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961] focus:outline-none transition-all"
                />
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-650 mb-1.5 font-mono">
                  Nomor Handphone <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="text"
                  name="nomorHp"
                  required
                  value={formData.nomorHp}
                  onChange={handleInputChange}
                  placeholder="Minimal 10 digit (misal: 08123456789)"
                  className="w-full rounded-lg border border-zinc-200 bg-[#FFFFFF] px-4.5 py-3 text-sm text-[#1A1A1A] placeholder-zinc-400 focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961] focus:outline-none transition-all"
                />
              </div>

              {/* Message field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-650 mb-1.5 font-mono">
                  Rincian Deskripsi Pesan <span className="text-[#B33A3A]">*</span>
                </label>
                <textarea
                  name="pesan"
                  required
                  rows={4}
                  value={formData.pesan}
                  onChange={handleInputChange}
                  placeholder="Tuliskan pertanyaan Anda secara terperinci..."
                  className="w-full rounded-lg border border-zinc-200 bg-[#FFFFFF] px-4.5 py-3 text-sm text-[#1A1A1A] placeholder-zinc-400 focus:ring-1 focus:ring-[#C9A961] focus:border-[#C9A961] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Validation alert logs if existing */}
              {errorMsg && (
                <div className="rounded-lg bg-[#B33A3A]/5 border border-[#B33A3A]/30 p-4 text-xs text-[#B33A3A] flex items-start space-x-2.5 font-medium leading-relaxed">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-4 text-xs text-emerald-800 flex items-start space-x-2.5 font-medium leading-relaxed">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit trigger button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#C9A961] text-black font-bold tracking-wider font-sans text-sm py-4 px-4 shadow-md hover:bg-[#b09355] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2.5"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Kirim Pesan</span>
                  </>
                )}
              </motion.button>

            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
