import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AuditLog } from '../types.js';
import { History, Search, FileText, User, ShieldCheck } from 'lucide-react';

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = () => {
    setLoading(true);
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
    fetch('/api/audit-logs', { headers })
      .then((res) => res.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load audit logs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTanggal = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.userEmail.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.propertyName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* Upper header section with search capabilities */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#121215] border border-zinc-850 p-6 rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-[#C9A961] uppercase tracking-wide flex items-center space-x-2.5">
            <History className="h-5 w-5 text-brand-gold shrink-0" />
            <span>Audit Log & Mutasi Sistem</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Pencatatan mutasi mutlak real-time. Melacak aktivitas pembuatan unit baru, pembaruan parameter, pembekuan akun admin, hingga siklus pemulihan arsip.
          </p>
        </div>

        {/* Clean gold highlighted Search utilities */}
        <div className="relative max-w-sm w-full shrink-0 group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 group-focus-within:text-brand-gold transition-colors">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari email pelaku, jenis aksi, target..."
            className="w-full rounded-xl bg-zinc-950/90 border-2 border-zinc-800 focus:border-[#C9A961] focus:outline-none pl-11 pr-4 py-3 text-xs text-zinc-100 placeholder-zinc-500 font-sans transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-[#121215] border border-zinc-850 rounded-2xl">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
          <p className="text-xs text-zinc-500 font-mono tracking-wider">MENGAMBIL ARSIP LOGS...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-2xl border-2 border-zinc-850 bg-[#121215]/30 p-16 text-center text-zinc-500 text-xs text-zinc-400">
          Belum ada rekaman audit log sistem yang cocok dengan kueri pencarian Anda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-850 bg-[#121215] shadow-2xl">
          <table className="w-full border-collapse text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-[10px] font-black uppercase tracking-wider text-brand-gold border-b border-zinc-900/85">
              <tr>
                <th className="px-6 py-4.5 whitespace-nowrap">Timestamp</th>
                <th className="px-6 py-4.5">Administrator / Agen</th>
                <th className="px-6 py-4.5">Jenis Operasi</th>
                <th className="px-6 py-4.5">Objek Kelolaan</th>
                <th className="px-6 py-4.5">Rincian Rigid Transaksi (Diff)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/20 transition-colors">
                  {/* Timestamp logs */}
                  <td className="px-6 py-4.5 font-mono text-zinc-500 whitespace-nowrap text-xs font-semibold">
                    {formatTanggal(log.createdAt)}
                  </td>
                  
                  {/* User details */}
                  <td className="px-6 py-4.5">
                    <span className="font-extrabold text-zinc-100 block text-xs">{log.userEmail}</span>
                    <span className="block text-[9px] text-zinc-650 font-mono mt-1 tracking-wider uppercase">OPERATOR ID: {log.userId}</span>
                  </td>
                  
                  {/* Mutation action pill */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span className={`inline-block rounded-lg px-2.5 py-1 text-[9px] uppercase tracking-widest font-black border ${
                      log.action.includes('TAMBAH') 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : log.action.includes('HAPUS') 
                        ? 'bg-rose-500/10 text-rose-400 border-[#B33A3A]/20' 
                        : log.action.includes('UPDATE') || log.action.includes('RESET')
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  
                  {/* Core asset identifier target */}
                  <td className="px-6 py-4.5">
                    <span className="text-zinc-200 font-extrabold text-xs block">{log.propertyName}</span>
                    <span className="block text-[9px] text-zinc-600 font-mono mt-1 tracking-wider uppercase">UNIT ID: {log.propertyId}</span>
                  </td>
                  
                  {/* Detailed changes markup JSON */}
                  <td className="px-6 py-4.5 max-w-xs md:max-w-md">
                    {log.oldData || log.newData ? (
                      <div className="space-y-2 font-mono text-[10px] text-zinc-400 max-h-32 overflow-y-auto bg-zinc-950 border border-zinc-850 p-3 rounded-xl select-all">
                        {log.oldData && (
                          <div className="space-y-1">
                            <span className="text-rose-400 font-semibold uppercase text-[8px] tracking-wide block">Sebelum Perubahan (Old Data):</span>
                            <pre className="whitespace-pre-wrap leading-tight text-[10px] text-zinc-500">
                              {JSON.stringify(log.oldData, null, 1)}
                            </pre>
                          </div>
                        )}
                        {log.newData && (
                          <div className={log.oldData ? 'pt-2.5 border-t border-zinc-900 space-y-1' : 'space-y-1'}>
                            <span className="text-emerald-400 font-semibold uppercase text-[8px] tracking-wide block">Setelah Perubahan (New Data):</span>
                            <pre className="whitespace-pre-wrap leading-tight text-[10px] text-zinc-400 font-bold">
                              {JSON.stringify(log.newData, null, 1)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-650 font-mono text-[10px]">Aksi terekam tanpa lampiran metadata perubahan</span>
                    )}
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
