import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types.js';
import { Archive, RotateCcw, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ArchiveTabProps {
  onRestoreSuccess: () => void;
}

export default function ArchiveTab({ onRestoreSuccess }: ArchiveTabProps) {
  const [archived, setArchived] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Elegant notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const getAuthHeaders = () => {
    const localUserStr = localStorage.getItem('prime_agent_user');
    const headers: Record<string, string> = {};
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

  const fetchArchived = () => {
    setLoading(true);
    fetch('/api/properties-archived', { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setArchived(Array.isArray(data) ? data : []);
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load archived properties:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/properties/${id}/restore`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) {
        triggerNotification('error', data.error || 'Gagal memulihkan properti dari arsip.');
      } else {
        triggerNotification('success', `Sukses! Properti "${name}" berhasil dipulihkan ke database aktif.`);
        fetchArchived();
        onRestoreSuccess();
      }
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Terjadi kesalahan jaringan saat memproses pemulihan data.');
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 font-sans text-left relative">
      
      {/* Alert banner section */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            className={`rounded-2xl border p-4 text-xs font-semibold flex items-start space-x-3 shadow-xl ${
              notification.type === 'success' 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950/40 border-[#B33A3A]/30 text-rose-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
            )}
            <span className="leading-relaxed">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121215] border border-zinc-850 p-6 rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-[#C9A961] uppercase tracking-wide flex items-center space-x-2.5">
            <Archive className="h-5 w-5 text-brand-gold shrink-0" />
            <span>Kubah Arsip Terhapus (Trash Vault)</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Sistem soft-delete memproteksi integritas data Prime Property. Seluruh unit yang dihapus tersimpan aman di kubah ini sebelum dipulihkan kembali ke listing aktif oleh Superadmin.
          </p>
        </div>
        
        {archived.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2 shrink-0 sm:text-right">
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider font-mono">TOTAL ARSIP</span>
            <span className="text-sm font-black text-[#C9A961] font-mono">{archived.length} Unit Tersegel</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-[#121215] border border-zinc-850 rounded-2xl">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
          <p className="text-xs text-zinc-500 font-mono tracking-wider">MENSINKRONKAN BERKAS ARSIP...</p>
        </div>
      ) : archived.length === 0 ? (
        <div className="rounded-2xl border-2 border-zinc-850 bg-[#121215]/30 p-16 text-center text-zinc-500 text-xs">
          Kubah arsip dalam kondisi kosong. Tidak ada data yang dihapus saat ini.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-850 bg-[#121215] shadow-2xl">
          <table className="w-full border-collapse text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-[10px] font-black uppercase tracking-wider text-brand-gold border-b border-zinc-900/80">
              <tr>
                <th className="px-6 py-4.5">Nama Properti & ID</th>
                <th className="px-6 py-4.5">Tipe & Cluster</th>
                <th className="px-6 py-4.5 font-mono">Lebar x Panjang</th>
                <th className="px-6 py-4.5">Harga Jual</th>
                <th className="px-6 py-4.5">Kawasan Kota</th>
                <th className="px-6 py-4.5 text-center">Tindakan Memulihkan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {archived.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-900/20 transition-colors">
                  <td className="px-6 py-4.5">
                    <span className="font-extrabold text-zinc-100 block text-sm">{p.nama_property}</span>
                    <span className="text-[9px] text-zinc-650 font-mono block mt-1 tracking-wider uppercase">ARCHIVE ID: {p.id}</span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-zinc-300 font-bold block">{p.tipe}</span>
                    <span className="text-[10px] text-zinc-500 font-mono italic">{p.group || 'Tanpa Sektor'}</span>
                  </td>
                  <td className="px-6 py-4.5 font-mono text-zinc-400">
                    {p.lebar}m &times; {p.panjang}m
                  </td>
                  <td className="px-6 py-4.5 font-black text-[#C9A961] text-sm">
                    {formatRupiah(p.price)}
                  </td>
                  <td className="px-6 py-4.5 text-zinc-400">
                    <div className="flex flex-wrap gap-1">
                      {p.kawasan.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-center">
                    <button
                      onClick={() => handleRestore(p.id, p.nama_property)}
                      className="cursor-pointer inline-flex items-center space-x-1.5 rounded-xl bg-brand-gold/10 border border-brand-gold/30 hover:bg-brand-gold hover:text-black px-4 py-2.5 text-xs font-black text-brand-gold transition-colors duration-150"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>RECOVER DATA</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
