import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Edit3, Trash2, Calendar, FileText, CheckCircle, 
  HelpCircle, AlertTriangle, Layers, Maximize2, Compass, AlertCircle, Save, Check, ChevronRight
} from 'lucide-react';
import { Property, User } from '../types.js';

interface PropertyDrawerProps {
  propertyId: string | null;
  currentUser: User | null;
  onClose: () => void;
  onUpdateSuccess: () => void;
  onDeleteSuccess: () => void;
}

export default function PropertyDrawer({
  propertyId,
  currentUser,
  onClose,
  onUpdateSuccess,
  onDeleteSuccess
}: PropertyDrawerProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState<Partial<Property>>({});
  const [originalData, setOriginalData] = useState<Partial<Property>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Confirmation Modals State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load property details whenever propertyId changes
  useEffect(() => {
    if (propertyId) {
      setLoading(true);
      setIsEditing(false);
      setFormErrors({});
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
      fetch(`/api/properties/${propertyId}`, { headers })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load');
          return res.json();
        })
        .then((data) => {
          setProperty(data);
          setFormData(data);
          setOriginalData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setProperty(null);
    }
  }, [propertyId]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatTanggal = (isoString?: string) => {
    if (!isoString) return '-';
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    try {
      const d = new Date(isoString);
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return isoString;
    }
  };

  // Check if field has been changed from its original state
  const isDirty = (field: keyof Property) => {
    if (!isEditing) return false;
    const currentVal = formData[field];
    const originalVal = originalData[field];

    if (Array.isArray(currentVal) && Array.isArray(originalVal)) {
      return JSON.stringify(currentVal.sort()) !== JSON.stringify(originalVal.sort());
    }
    return currentVal !== originalVal;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    
    let processedValue: any = value;
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'lebar' || name === 'panjang' || name === 'tingkat' || name === 'price') {
      processedValue = value === '' ? '' : parseFloat(value);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleHadapToggle = (dir: string) => {
    const current = [...(formData.hadap || [])];
    const idx = current.indexOf(dir);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(dir);
    }
    setFormData((prev) => ({ ...prev, hadap: current }));
  };

  const handleKawasanToggle = (kws: string) => {
    const current = [...(formData.kawasan || [])];
    const idx = current.indexOf(kws);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(kws);
    }
    setFormData((prev) => ({ ...prev, kawasan: current }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nama_property || formData.nama_property.trim().length < 3 || formData.nama_property.trim().length > 100) {
      errors.nama_property = 'Nama properti wajib diisi di antara 3 hingga 100 karakter.';
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Harga wajib diisi dengan nilai integer rupiah yang lebih besar dari 0.';
    }

    const lebarNum = Number(formData.lebar);
    if (isNaN(lebarNum) || lebarNum <= 0) {
      errors.lebar = 'Lebar tanah wajib diisi, numerik, dan lebih besar dari 0.';
    }

    const panjangNum = Number(formData.panjang);
    if (isNaN(panjangNum) || panjangNum <= 0) {
      errors.panjang = 'Panjang tanah wajib diisi, numerik, dan lebih besar dari 0.';
    }

    const tingkatNum = Number(formData.tingkat);
    if (isNaN(tingkatNum) || tingkatNum < 1 || tingkatNum > 10) {
      errors.tingkat = 'Tingkat lantai wajib di antara rentang 1 hingga 10 lantai.';
    }

    if (formData.maps_link && formData.maps_link.trim() !== '') {
      if (!formData.maps_link.toLowerCase().includes('google.com/maps')) {
        errors.maps_link = 'Link Google Maps harus berupa URL lengkap valid yang berisi domain "google.com/maps"';
      }
    }

    if (!formData.kawasan || formData.kawasan.length === 0) {
      errors.kawasan = 'Silakan pilih setidaknya satu kawasan lokasi.';
    }

    if (!formData.hadap || formData.hadap.length === 0) {
      errors.hadap = 'Silakan centang arah hadap properti.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const localUserStr = localStorage.getItem('prime_agent_user');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (localUserStr) {
        try {
          const user = JSON.parse(localUserStr);
          headers['Authorization'] = `Bearer ${user.id}`;
          headers['x-session-token'] = user.id;
        } catch (e) {
          console.error(e);
        }
      }
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormErrors({ general: data.error || 'Gagal memperbarui properti.' });
      } else {
        setIsEditing(false);
        setProperty(data);
        setOriginalData(data);
        onUpdateSuccess();
      }
    } catch (err) {
      console.error(err);
      setFormErrors({ general: 'Error jaringan terdeteksi saat menyimpan perubahan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!propertyId) return;
    try {
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
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        throw new Error('Gagal menghapus');
      }

      setShowDeleteConfirm(false);
      onDeleteSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus properti ini.');
    }
  };

  if (!propertyId) return null;

  return (
    <>
      {/* Background glass overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md"
      />

      {/* Main Premium Drawer Container */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#111114] border-l-2 border-zinc-800 shadow-2xl flex flex-col h-full font-sans text-white overflow-hidden"
      >
        {/* Dynamic Header Block with Elegant Visual Statuses */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-850 bg-zinc-950/80 shrink-0">
          <div className="flex items-center space-x-3 text-left">
            <span className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1 text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase leading-none">
              Portal Inventori
            </span>
            {property && (
              <span className={`rounded-full px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wide border leading-none ${
                property.status === 'in_stock'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : 'bg-[#B33A3A]/10 text-rose-400 border-[#B33A3A]/25'
              }`}>
                {property.status === 'in_stock' ? '✓ In Stock' : '✗ Sold Out'}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {currentUser?.role === 'superadmin' && property && (
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-xl bg-gradient-to-r from-brand-gold to-[#bda05d] text-zinc-950 hover:brightness-110 px-4 py-2 text-xs font-extrabold tracking-wide transition-all duration-150 flex items-center space-x-1.5 cursor-pointer shadow-md shadow-brand-gold/10"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Ubah Data</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="rounded-xl border border-[#B33A3A]/30 bg-[#B33A3A]/5 hover:bg-[#B33A3A] hover:text-white px-4 py-2 text-xs font-bold text-rose-400 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus Unit</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(originalData);
                      setFormErrors({});
                    }}
                    className="rounded-xl border border-zinc-700 bg-transparent hover:bg-zinc-800/60 px-4 py-2 text-xs font-bold text-zinc-400 transition-all duration-150 cursor-pointer"
                  >
                    Batalkan Edit
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Main body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-zinc-950/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-gold border-t-transparent" />
              <p className="text-xs text-zinc-500 font-mono tracking-wider">MENGAMBIL RIGID DATA...</p>
            </div>
          ) : !property ? (
            <div className="text-center text-zinc-500 py-16">Data internal properti gagal ditarik atau tidak ditemukan.</div>
          ) : !isEditing ? (
            /* ----------------- READ ONLY MODE (STORYBOOK DETAIL COHESIVE LOOK) ----------------- */
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Top Banner Cover Box */}
              <div className="bg-[#18181B] border border-zinc-800 p-6 rounded-2xl relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 h-40 w-40 bg-brand-gold/5 blur-3xl rounded-full" />
                {property.group && (
                  <span className="inline-block rounded bg-brand-gold/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#C9A961] border border-brand-gold/20 mb-3">
                    Cluster: {property.group}
                  </span>
                )}
                
                <h2 className="text-2xl font-black text-white tracking-tight leading-tight uppercase font-sans">
                  {property.nama_property}
                </h2>
                
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-zinc-800/60">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Nilai Akses Jual</span>
                    <p className="text-2xl font-black text-[#C9A961]">{formatRupiah(property.price)}</p>
                  </div>
                  {property.unit && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 sm:text-right h-fit shrink-0">
                      <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider font-mono">NOMOR UNIT</span>
                      <span className="text-sm font-black text-white font-mono">{property.unit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specification Dashboard grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#C9A961] font-mono flex items-center space-x-2">
                  <span>●</span> <span>Rincian Fisik & Administrasi</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Spesifikasi Item Template cards */}
                  <div className="bg-[#121215] border border-zinc-850 p-4 rounded-xl flex items-start space-x-3 hover:border-zinc-800 transition-colors">
                    <div className="p-2 bg-zinc-900 rounded-lg text-brand-gold border border-zinc-800 mt-0.5">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono block">Dimensi Bidang</span>
                      <span className="text-sm font-extrabold text-zinc-100 mt-1 block">
                        Lebar {property.lebar}m &times; Panjang {property.panjang}m
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        Luas Tanah: {property.lebar * property.panjang} m&sup2;
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#121215] border border-zinc-850 p-4 rounded-xl flex items-start space-x-3 hover:border-zinc-800 transition-colors">
                    <div className="p-2 bg-zinc-900 rounded-lg text-brand-gold border border-zinc-800 mt-0.5">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono block">Arah Hadap Bangunan</span>
                      <span className="text-sm font-extrabold text-zinc-100 mt-1 block">
                        {property.hadap.join(', ') || '-'}
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">Arah hadap sirkulasi udara utama</span>
                    </div>
                  </div>

                  <div className="bg-[#121215] border border-zinc-850 p-4 rounded-xl flex items-start space-x-3 hover:border-zinc-800 transition-colors">
                    <div className="p-2 bg-zinc-900 rounded-lg text-[#C9A961] border border-zinc-800 mt-0.5">
                      <Maximize2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono block">Tipe & Konstruksi</span>
                      <span className="text-sm font-extrabold text-zinc-100 mt-1 block">
                        {property.tipe} &mdash; {property.tingkat} Lantai
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        {property.carport ? '✓ Dilengkapi ruang Garasi/Carport' : '✗ Tanpa area Garasi'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#121215] border border-zinc-850 p-4 rounded-xl flex items-start space-x-3 hover:border-zinc-800 transition-colors">
                    <div className="p-2 bg-zinc-900 rounded-lg text-brand-gold border border-zinc-800 mt-0.5">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono block">Kesiapan Huni</span>
                      <span className="text-sm font-extrabold text-zinc-100 mt-1 block">
                        {property.siap === 'siap_huni' && 'Siap Huni (Kondisi Bagus)'}
                        {property.siap === 'siap_kosong' && 'Siap Kosong (Baru/Belum Furnished)'}
                        {property.siap === 'siap_huni_renovasi' && 'Siap Huni (Perlu Renovasi Minor)'}
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">Kondisi real fisik bangunan saat ini</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regional Placement Area */}
              <div className="bg-[#121215] border border-zinc-850 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Cakupan Wilayah / Kawasan</span>
                <div className="flex flex-wrap gap-2 mt-3 select-none">
                  {property.kawasan.map((tag, i) => (
                    <div 
                      key={tag} 
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-805 border-zinc-800 text-xs font-bold text-zinc-300 flex items-center space-x-1.5"
                    >
                      <MapPin className="h-3 w-3 text-brand-gold" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Geolocator Block */}
              {property.maps_link ? (
                <div className="rounded-2xl bg-zinc-900/40 border-2 border-brand-gold/15 p-6 space-y-3 relative overflow-hidden">
                  <div className="flex items-center space-x-2.5 text-[#C9A961]">
                    <MapPin className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider font-mono">Verifikasi Kordinat Satelit</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
                    Titik peta presisi super telah disematkan oleh tim surveyor untuk mempermudah survei lapangan eksklusif bersama calon buyer.
                  </p>
                  <a
                    href={property.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer inline-flex items-center space-x-2 text-xs font-extrabold text-[#111] bg-gradient-to-r from-brand-gold to-[#bda05d] hover:brightness-110 transition-all rounded-xl px-5 py-3 mt-2 shadow-lg shadow-brand-gold/5"
                  >
                    <span>Luncurkan Google Maps Navigasi</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-6 text-xs text-zinc-500 text-center font-mono">
                  Tidak ada data Google Maps yang di-embed pada unit properti ini.
                </div>
              )}

              {/* Audit Footer Metadata logs */}
              <div className="pt-6 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Update Terakhir</span>
                </span>
                <span className="text-zinc-400 font-semibold">{formatTanggal(property.updated_at)}</span>
              </div>

            </div>
          ) : (
            /* ----------------- SUPERADMIN INTERATIVE EDIT FORM (AC-8.2) ----------------- */
            <form onSubmit={handleUpdateSubmit} className="space-y-6 text-left animate-fade-in">
              
              {/* Top Edit Information Alert Badge */}
              <div className="bg-zinc-900/90 border border-brand-gold/25 p-4 rounded-xl text-xs text-zinc-300 flex items-start space-x-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-brand-gold" />
                <AlertCircle className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-brand-gold font-bold">MODE REVISI INTERAKTIF AKTIF</p>
                  <p className="text-zinc-400 leading-relaxed">
                    Setiap isian input yang telah diubah dari nilai semula akan diwarnai outline bercahaya <span className="text-white underline font-bold">Emas</span> sebagai penanda perubahan dinamis sebelum disimpan ke database.
                  </p>
                </div>
              </div>

              {formErrors.general && (
                <div className="rounded-xl bg-red-950/40 border-2 border-[#B33A3A] p-4 text-xs text-red-200">
                  {formErrors.general}
                </div>
              )}

              {/* Grid System of Editor Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-[#121215] border border-zinc-850 p-6 rounded-2xl">
                
                {/* Nama Properti */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Nama Judul Properti <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_property"
                    required
                    value={formData.nama_property || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: Ruko Golden Palace No. 12"
                    className={`w-full rounded-xl bg-zinc-950/90 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 transition-all border-2 ${
                      isDirty('nama_property') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  />
                  {formErrors.nama_property ? (
                    <span className="text-[11px] text-red-400 font-semibold mt-1 block">{formErrors.nama_property}</span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">Judul unit yang akan dipublish ke landing katalog utama.</span>
                  )}
                </div>

                {/* Group Cluster */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Grup / Cluster Properti
                  </label>
                  <input
                    type="text"
                    name="group"
                    value={formData.group || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: Blok B / Sektor Timur"
                    className={`w-full rounded-xl bg-zinc-950/90 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 transition-all border-2 ${
                      isDirty('group') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  />
                </div>

                {/* Unit Ident */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Nomor Unit / Blok
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: B-32A"
                    className={`w-full rounded-xl bg-zinc-950/90 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 transition-all border-2 ${
                      isDirty('unit') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Apresiasi Harga (Rupiah) <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    placeholder="Masukkan angka penuh tanpa titik"
                    className={`w-full rounded-xl bg-zinc-950/90 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 transition-all border-2 ${
                      isDirty('price') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  />
                  {formErrors.price && (
                    <span className="text-[11px] text-red-400 font-semibold mt-1 block">{formErrors.price}</span>
                  )}
                </div>

                {/* Tipe Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Tipe Properti <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <div className="flex space-x-6 py-2">
                    {['Ruko', 'Villa'].map((t) => (
                      <label key={t} className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
                        <input
                          type="radio"
                          name="tipe"
                          value={t}
                          checked={formData.tipe === t}
                          onChange={handleInputChange}
                          className="accent-brand-gold h-4 w-4"
                        />
                        <span className="font-semibold text-zinc-300">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Lebar */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Lebar Tanah (m) <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="lebar"
                    required
                    value={formData.lebar || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: 6.5"
                    className={`w-full rounded-xl bg-zinc-950/90 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 transition-all border-2 ${
                      isDirty('lebar') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  />
                  {formErrors.lebar && (
                    <span className="text-[11px] text-red-400 font-semibold mt-1 block">{formErrors.lebar}</span>
                  )}
                </div>

                {/* Panjang */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Panjang Tanah (m) <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="panjang"
                    required
                    value={formData.panjang || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: 15"
                    className={`w-full rounded-xl bg-zinc-950/90 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 transition-all border-2 ${
                      isDirty('panjang') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  />
                  {formErrors.panjang && (
                    <span className="text-[11px] text-red-400 font-semibold mt-1 block">{formErrors.panjang}</span>
                  )}
                </div>

                {/* Tingkat */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Jumlah Tingkat Lantai <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="tingkat"
                    required
                    value={formData.tingkat || ''}
                    onChange={handleInputChange}
                    placeholder="Contoh: 2 atau 3.5"
                    className={`w-full rounded-xl bg-zinc-950/90 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 transition-all border-2 ${
                      isDirty('tingkat') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  />
                  {formErrors.tingkat && (
                    <span className="text-[11px] text-red-400 font-semibold mt-1 block">{formErrors.tingkat}</span>
                  )}
                </div>

                {/* Carport Checkbox */}
                <div className="flex items-center pt-5 h-full select-none">
                  <label className="flex items-center space-x-3 text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      name="carport"
                      checked={!!formData.carport}
                      onChange={handleInputChange}
                      className="accent-brand-gold h-5 w-5 rounded-lg text-zinc-950"
                    />
                    <span className="font-bold text-zinc-300 group-hover:text-white transition-colors">
                      Tersedia Garasi / Carport
                    </span>
                  </label>
                </div>

                {/* Kesiapan Konstruksi */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Kesiapan Fisik Bangunan <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <select
                    name="siap"
                    value={formData.siap || 'siap_huni'}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl bg-zinc-950 px-3.5 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 border-2 ${
                      isDirty('siap') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  >
                    <option value="siap_huni">Siap Huni</option>
                    <option value="siap_kosong">Siap Kosong</option>
                    <option value="siap_huni_renovasi">Siap Huni (Perlu Renovasi)</option>
                  </select>
                </div>

                {/* Status Penjualan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Status Jual Ketersediaan <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status || 'in_stock'}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl bg-zinc-950 px-3.5 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 border-2 ${
                      isDirty('status') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  >
                    <option value="in_stock">In Stock (Tersedia)</option>
                    <option value="sold_out">Sold Out (Terjual)</option>
                  </select>
                </div>

                {/* Hadap Checkboxes Utara, Selatan, Timur, Barat */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Arah Hadap Bangunan <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <div className="flex flex-wrap gap-5 py-2 select-none">
                    {['Utara', 'Selatan', 'Timur', 'Barat'].map((dir) => {
                      const checked = (formData.hadap || []).includes(dir);
                      return (
                        <label key={dir} className="flex items-center space-x-2 text-sm cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleHadapToggle(dir)}
                            className="accent-brand-gold h-4.5 w-4.5 rounded text-zinc-950"
                          />
                          <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">{dir}</span>
                        </label>
                      );
                    })}
                  </div>
                  {formErrors.hadap && (
                    <span className="text-[11px] text-red-400 font-semibold block mt-1">{formErrors.hadap}</span>
                  )}
                </div>

                {/* Kawasan Multi Tags */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Kawasan Lokasi (Kota/Daerah) <span className="text-[#B33A3A] font-bold">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5 py-1">
                    {['Krakatau', 'Pancing', 'Cemara Asri/Kuala', 'Tembung', 'Helvetia'].map((kws) => {
                      const checked = (formData.kawasan || []).includes(kws);
                      return (
                        <button
                          key={kws}
                          type="button"
                          onClick={() => handleKawasanToggle(kws)}
                          className={`px-3.5 py-2 text-xs rounded-xl font-bold border-2 transition-all cursor-pointer ${
                            checked 
                              ? 'bg-brand-gold/20 border-brand-gold text-[#C9A961] shadow-sm shadow-brand-gold/10' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          {checked ? '✓ ' : ''}{kws}
                        </button>
                      );
                    })}
                  </div>
                  {formErrors.kawasan && (
                    <span className="text-[11px] text-red-400 font-semibold block mt-1">{formErrors.kawasan}</span>
                  )}
                </div>

                {/* Google Maps Link Field */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Alamat Lengkap Link Google Maps
                  </label>
                  <input
                    type="text"
                    name="maps_link"
                    value={formData.maps_link || ''}
                    onChange={handleInputChange}
                    placeholder="https://www.google.com/maps/place/..."
                    className={`w-full rounded-xl bg-zinc-950/90 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/15 transition-all border-2 ${
                      isDirty('maps_link') ? 'border-brand-gold shadow-sm shadow-brand-gold/20' : 'border-zinc-800'
                    }`}
                  />
                  {formErrors.maps_link ? (
                    <span className="text-[11px] text-red-400 font-semibold mt-1 block">{formErrors.maps_link}</span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 block">Isi koordinat url lengkap dari aplikasi Google Maps.</span>
                  )}
                </div>

              </div>

              {/* Form trigger action controllers */}
              <div className="pt-4 border-t border-zinc-850 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(originalData);
                    setFormErrors({});
                  }}
                  className="rounded-xl border border-zinc-700 bg-transparent hover:bg-zinc-800 px-5  py-3 text-xs font-black text-zinc-400 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-brand-gold to-[#bda05d] text-zinc-950 font-black px-6 py-3 text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center space-x-2 cursor-pointer shadow-lg shadow-brand-gold/10 hover:brightness-110"
                >
                  {submitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Simpan Ke Database</span>
                </button>
              </div>

            </form>
          )}
        </div>
      </motion.div>

      {/* Extreme Alert Dialog Delete Prompt (AC-8.3) */}
      <AnimatePresence>
        {showDeleteConfirm && property && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border-2 border-[#B33A3A] bg-[#121215] p-6 shadow-2xl text-white font-sans text-center space-y-5"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B33A3A]/10 border border-[#B33A3A]/30 text-[#B33A3A]">
                <AlertTriangle className="h-7 w-7 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black uppercase tracking-wider text-rose-100">PENGHAPUSAN UNIT MUTLAK</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Apakah Anda benar-benar yakin ingin menghapus unit <span className="text-brand-gold font-extrabold text-sm block my-1">[{property.nama_property}]</span>? Tindakan ini bersifat permanen dan akan melahirkan audit log baru.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-1 select-none">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-zinc-750 bg-transparent hover:bg-zinc-800 text-xs text-zinc-400 px-4 py-3 font-extrabold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  className="rounded-xl bg-[#B33A3A] hover:bg-red-700 text-xs text-white px-5 py-3 font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-red-950/20"
                >
                  Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  function generalError() {
    return formErrors.general;
  }
}
