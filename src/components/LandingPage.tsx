import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navigate } from '../lib/router.js';
import { 
  Award, MapPin, BadgeDollarSign, Users, ChevronRight, Eye, Building2, X, Sparkles, 
  Search, ArrowUpDown, Clock, Building
} from 'lucide-react';
import { Property } from '../types.js';

export default function LandingPage() {
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time Interactive filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipe, setSelectedTipe] = useState<'Semua' | 'Ruko' | 'Villa'>('Semua');
  const [selectedKawasan, setSelectedKawasan] = useState<string>('Semua');
  const [selectedHadap, setSelectedHadap] = useState<string>('Semua');
  const [budgetTier, setBudgetTier] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<string>('price-asc');

  // Property detail popup
  const [selectedDemoProperty, setSelectedDemoProperty] = useState<Property | null>(null);

  const propertiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/public/featured')
      .then((res) => res.json())
      .then((data) => {
        setFeatured(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading featured items: ', err);
        setLoading(false);
      });
  }, []);

  const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter listings based on user input queries
  const processedFeatured = featured.filter((p) => {
    // 1. Text Search query
    const matchQuery = 
      p.nama_property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.group && p.group.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 2. Tipe (Ruko / Villa)
    const matchTipe = selectedTipe === 'Semua' || p.tipe === selectedTipe;

    // 3. Kawasan
    const matchKawasan = selectedKawasan === 'Semua' || p.kawasan.includes(selectedKawasan);

    // 4. Arah Hadap
    const matchHadap = selectedHadap === 'Semua' || p.hadap.includes(selectedHadap);

    // 5. Budget Tier
    let matchBudget = true;
    if (budgetTier === 'under1b') {
      matchBudget = p.price < 1000000000;
    } else if (budgetTier === '1b-3b') {
      matchBudget = p.price >= 1000000000 && p.price <= 3000000000;
    } else if (budgetTier === 'over3b') {
      matchBudget = p.price > 3000000000;
    }

    return matchQuery && matchTipe && matchKawasan && matchHadap && matchBudget;
  });

  // Sorting logic
  const sortedFeatured = [...processedFeatured].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.nama_property.localeCompare(b.nama_property);
    return 0;
  });

  // Unique list of Kawasan from raw featured listing
  const allUniqueKawasan = Array.from(
    new Set(featured.flatMap((p) => p.kawasan))
  );

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#1A1A1A] font-sans selection:bg-[#C9A961] selection:text-black">
      
      {/* 1. HERO SECTION - Premium Deep Obsidian & Golden Glow Background */}
      <section className="relative overflow-hidden bg-[#121215] text-white py-24 md:py-32 border-b-2 border-[#C9A961]/20">
        {/* Subtle decorative golden glowing elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-[#C9A961]/15 to-[#bda05d]/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        
        {/* Blueprint thin grid overlays in the background to emphasize modern structural precision */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#C9A961_1px,transparent_1px),linear-gradient(to_bottom,#C9A961_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex flex-col items-center">
            
            {/* Elegant luxury chip badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-8 inline-flex items-center space-x-2 rounded-full border border-[#C9A961]/35 bg-[#C9A961]/10 px-5 py-2.5 text-[10px] font-mono font-black uppercase tracking-widest text-[#C9A961]"
            >
              <Sparkles className="h-4 w-4 text-[#C9A961]" />
              <span>THE EXCLUSIVE LUXURY CATALOG</span>
            </motion.div>
  
            {/* Tagline Prime Property */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="mt-2 text-4xl font-black tracking-tight sm:text-5xl md:text-7xl max-w-5xl leading-tight text-center"
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C9A961] via-[#e5c47f] to-[#bda05d]">
                PRIME PROPERTY
              </span>
              <span className="block mt-4 text-xl sm:text-2xl md:text-4xl font-medium tracking-normal text-zinc-300">
                Katalog Real Estat Termegah & Terverifikasi
              </span>
            </motion.h1>
  
            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mx-auto mt-8 max-w-3xl text-sm sm:text-base text-zinc-400 leading-relaxed font-sans"
            >
              Portal resmi kurasi unit Ruko strategis dan Villa eksklusif secara profesional. Menyajikan cetakan biru arsitektur presisi, sirkulasi arah hadap terbaik, serta transparansi legalitas mutlak langsung dari tim pengembang eksekutif.
            </motion.p>
  
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
              className="mt-12 flex flex-col sm:flex-row gap-5 justify-center w-full max-w-md"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => scrollToSection(propertiesRef)}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#C9A961] to-[#bda05d] hover:brightness-110 px-8 py-4 font-sans text-xs uppercase tracking-widest font-black text-black transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#C9A961]/20 group"
              >
                <span>Lihat Unit Aktif</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/contact')}
                className="cursor-pointer rounded-xl border-2 border-[#C9A961]/40 bg-zinc-900/40 hover:bg-zinc-800/40 hover:border-[#C9A961] px-8 py-4 font-sans text-xs uppercase tracking-widest font-black text-white transition-all flex items-center justify-center space-x-2 text-center"
              >
                <span>Hubungi Konsultan</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC EXPLORE & COCKPIT CONTROLS */}
      <section ref={propertiesRef} className="py-24 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#C9A961] font-mono font-black block">EXCLUSIVE COLLECTION</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-[#1A1A1A] uppercase">
              Katalog & Lokasi Unit Terbaik
            </h2>
            <div className="mx-auto mt-4 h-1.5 w-20 bg-[#C9A961] rounded-full animate-pulse" />
            <p className="mt-4 text-zinc-500 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
              Jelajahi pilihan ruko strategis maupun villa impian terbaik Anda. Spesifikasi dijamin akurat sesuai pencatatan fisik di lapangan.
            </p>
          </div>

          {/* FEATURED PROPERTIES LISTING CARD GRID */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#C9A961] border-t-transparent" />
              <p className="text-xs text-zinc-400 font-mono">Menyelaraskan data real estat premium...</p>
            </div>
          ) : sortedFeatured.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-[#F9FAFB] p-20 text-center text-zinc-500 max-w-lg mx-auto">
              <Building2 className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
              <p className="text-sm font-semibold text-zinc-800">Unit Tidak Ditemukan</p>
              <p className="text-xs text-zinc-400 mt-2">Tidak ada properti di database yang cocok dengan kueri saringan filter Anda.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTipe('Semua');
                  setSelectedKawasan('Semua');
                  setSelectedHadap('Semua');
                  setBudgetTier('Semua');
                }}
                className="mt-5 rounded-lg px-4 py-2 border border-[#C9A961] bg-transparent text-[#C9A961] text-xs font-bold hover:bg-[#C9A961]/10 transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {sortedFeatured.map((p) => (
                  <motion.div
                    layout
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.12), 0 12px 16px -8px rgb(0 0 0 / 0.12)" }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    className="rounded-2xl border border-zinc-200 bg-[#FFFFFF] p-2 flex flex-col group cursor-pointer transition-colors duration-150"
                  >
                    {/* BLUEPRINT SCHEMATIC CARD IMAGE DECORATOR */}
                    <div className="relative h-48 w-full rounded-xl bg-[#121215] flex flex-col justify-between p-4 font-sans select-none overflow-hidden border border-zinc-900 shadow-inner">
                      {/* Architectural blueprint lines grid */}
                      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#C9A961_1px,transparent_1px)] [background-size:12px_12px] group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#C9A961]/10 rounded-full h-36 w-36 pointer-events-none" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-dashed border-[#C9A961]/5 rounded-full h-24 w-24 pointer-events-none animate-spin" style={{ animationDuration: '45s' }} />
                      
                      {/* Blueprint specifications text mockups for high engineering credibility layout */}
                      <div className="absolute bottom-3 right-3 font-mono text-[8px] text-[#C9A961]/40 leading-none text-right">
                        <span>PLAN REF: P-{p.id.substring(0,4).toUpperCase()}</span> <br />
                        <span>CAD SCALED METRIC</span>
                      </div>

                      {/* Header tags */}
                      <div className="flex justify-between items-center z-10 w-full">
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/35 px-2.5 py-1 text-[9px] font-bold text-[#52C41A] font-mono tracking-wider uppercase leading-none">
                          ✓ UNIT RESERVED
                        </span>
                        <span className="rounded bg-[#C9A961] px-2.5 py-1 text-[9px] font-black text-black uppercase tracking-wider leading-none font-mono">
                          {p.tipe}
                        </span>
                      </div>

                      {/* Footer tags */}
                      <div className="z-10 text-left">
                        <p className="text-[10px] text-[#C9A961] font-bold tracking-wider font-mono flex items-center space-x-1">
                          <MapPin className="h-3 w-3 shrink-0 text-[#C9A961]" />
                          <span>{p.kawasan.join(', ')}</span>
                        </p>
                      </div>
                    </div>

                    {/* Property Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between text-left">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <h3 className="text-base font-black text-[#1A1A1A] group-hover:text-[#C9A961] transition-colors duration-200 truncate">
                            {p.nama_property}
                          </h3>
                          {p.unit && (
                            <span className="text-[10px] font-semibold font-mono bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded border leading-none shrink-0 uppercase">
                              No {p.unit}
                            </span>
                          )}
                        </div>
                        
                        {p.group && (
                          <p className="text-[11px] text-zinc-400 mt-1 font-mono uppercase font-bold tracking-wider">
                            Sektor: <span className="text-zinc-600">{p.group}</span>
                          </p>
                        )}

                        {/* Dimensions metric grid */}
                        <div className="mt-4 grid grid-cols-2 gap-4 border-y border-zinc-100 py-3.5 text-xs text-zinc-500 font-mono bg-zinc-50/50 px-2 rounded-lg">
                          <div className="border-r border-zinc-100">
                            <span className="text-zinc-400 block text-[9px] uppercase font-bold">Dimensi Lahan</span>
                            <span className="text-[#1A1A1A] text-xs font-black block mt-0.5">{p.lebar} m &times; {p.panjang} m</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[9px] uppercase font-bold">Sirkulasi & Lantai</span>
                            <span className="text-[#1A1A1A] text-xs font-black block mt-0.5">
                              {p.tingkat} Lantai • Hadap {p.hadap[0] || 'Utara'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Investment Value & Actions Row */}
                      <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase block font-bold font-mono">Nilai Investasi</span>
                          <span className="text-base sm:text-lg font-black text-black">
                            {formatRupiah(p.price)}
                          </span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDemoProperty(p);
                          }}
                          className="cursor-pointer rounded-xl bg-[#121215] hover:bg-[#C9A961] hover:text-[#121215] text-[#C9A961] border border-[#C9A961]/40 px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 active:scale-95 shadow-xs"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Lihat Detail</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </section>

      {/* 3. VALUE PROPOSITIONS SECTION */}
      <section className="py-24 bg-[#FFFFFF] border-t border-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[#C9A961] font-mono font-bold">Kredibilitas Agen</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] uppercase">
              Mengapa Berinvestasi Bersama <span className="text-[#C9A961]">Prime Property</span>?
            </h2>
            <div className="mx-auto mt-3.5 h-1 w-16 bg-[#C9A961] rounded" />
            <p className="mt-4 text-zinc-500 max-w-xl mx-auto text-xs leading-relaxed">
              Kemitraan jangka panjang kami didasarkan pada profesionalisme, kepercayaan, dan keunggulan pelayanan properti komersial.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Award className="h-7 w-7 text-[#C9A961]" />,
                title: 'Terpercaya Sejak 2010',
                desc: 'Melayani penyeleksian ruko komersial dan villa privat premium dengan rekam sejarah hukum legalitas tanpa kendala.'
              },
              {
                icon: <MapPin className="h-7 w-7 text-[#C9A961]" />,
                title: 'Lokasi Strategis',
                desc: 'Seluruh unit terletak pada epicentrum ekonomi maupun kawasan wisata eksotis dengan akselerasi ROI tertinggi.'
              },
              {
                icon: <BadgeDollarSign className="h-7 w-7 text-[#C9A961]" />,
                title: 'Transparansi Nilai Pasar',
                desc: 'Penaksiran nilai aset secara rasional dan adil. Tanpa ada biaya tambahan gelap maupun taktik spekulasi harga.'
              },
              {
                icon: <Users className="h-7 w-7 text-[#C9A961]" />,
                title: 'Layanan Pengawasan Legal',
                desc: 'Pendampingan langsung mulai dari verifikasi BPN, AJB Notaris, sertifikat kepemilikan, hingga serah terima kunci.'
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-xl border border-zinc-100 bg-[#F9FAFB] p-7 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A961]/10 border border-[#C9A961]/35 mb-5">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A]">{item.title}</h3>
                <p className="mt-2.5 text-xs text-zinc-500 leading-relaxed font-sans">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MODAL INFO FOR DETAILED SPECIFICATIONS (RINCIAN / LIHAT DETAIL) */}
      <AnimatePresence>
        {selectedDemoProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop wrapper click to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDemoProperty(null)}
              className="absolute inset-0 bg-black/85 w-full h-full backdrop-blur-md"
            />

            {/* Modal Glass Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-xl rounded-2xl border-2 border-[#C9A961]/40 bg-[#121215] text-white p-6 sm:p-8 shadow-2xl text-left font-sans space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-[#C9A961]/5 blur-3xl rounded-full pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center space-x-2 text-[#C9A961]">
                  <Building className="h-5 w-5 animate-pulse" />
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider">Spesifikasi Rigid Properti</span>
                </div>
                <button 
                  onClick={() => setSelectedDemoProperty(null)}
                  className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Unit Title & Appraisal Section */}
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-1">
                  {selectedDemoProperty.group && (
                    <span className="inline-block rounded bg-[#C9A961]/10 border border-[#C9A961]/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#C9A961] mb-2 font-mono">
                      CLUSTER : {selectedDemoProperty.group}
                    </span>
                  )}
                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                    {selectedDemoProperty.nama_property}
                  </h3>
                  <div className="pt-3.5 border-t border-zinc-800 mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold block">Appraisal Price</span>
                      <span className="text-[#C9A961] text-lg font-black">{formatRupiah(selectedDemoProperty.price)}</span>
                    </div>
                    {selectedDemoProperty.unit && (
                      <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-right">
                        <span className="text-[9px] text-zinc-500 block font-bold font-mono uppercase leading-tight">Kaveling / No</span>
                        <span className="text-sm font-black text-white font-mono">{selectedDemoProperty.unit}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Specs Metric Breakdown */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Lebar & Panjang</span>
                    <span className="text-zinc-200 text-xs font-bold block mt-1">
                      {selectedDemoProperty.lebar}m &times; {selectedDemoProperty.panjang}m
                    </span>
                    <span className="text-[#C9A961]/80 text-[10px] block mt-0.5">({selectedDemoProperty.lebar * selectedDemoProperty.panjang} m² Luas Tanah)</span>
                  </div>

                  <div className="bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Arah Hadap Sirkulasi</span>
                    <span className="text-zinc-200 text-xs font-bold block mt-1">
                      {selectedDemoProperty.hadap.join(', ') || 'Utara'}
                    </span>
                    <span className="text-zinc-500 text-[10px] block mt-0.5">Sesuai orientasi kompas</span>
                  </div>

                  <div className="bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Arsitektur & Tingkat</span>
                    <span className="text-zinc-200 text-xs font-bold block mt-1">
                      {selectedDemoProperty.tipe} &mdash; {selectedDemoProperty.tingkat} Lantai
                    </span>
                    <span className="text-zinc-500 text-[10px] block mt-0.5">Konstruksi Beton Kokoh</span>
                  </div>

                  <div className="bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Fasilitas Carport</span>
                    <span className="text-zinc-200 text-xs font-bold block mt-1">
                      {selectedDemoProperty.carport ? 'Tersedia Carport' : 'Tanpa Carport'}
                    </span>
                    <span className="text-zinc-500 text-[10px] block mt-0.5">Area parkir terlindungi</span>
                  </div>
                </div>

                {/* Maps locator block */}
                {selectedDemoProperty.maps_link ? (
                  <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-4 space-y-3">
                    <div className="flex items-center space-x-2 text-[#C9A961]">
                      <MapPin className="h-4.5 w-4.5" />
                      <span className="text-xs font-black uppercase tracking-wider font-mono">Peta Koordinat Presisi</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                      Link navigasi satelit telah dipetakan presisi oleh tim surveyor untuk mempermudah survei mandiri di lokasi.
                    </p>
                    <a
                      href={selectedDemoProperty.maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer inline-flex items-center space-x-1.5 text-xs font-bold text-black bg-[#C9A961] hover:brightness-105 active:scale-95 duration-150 rounded-lg px-4 py-2.5 mt-1"
                    >
                      <span>Buka Google Maps Gps</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl bg-zinc-950/40 border border-zinc-800 py-4 text-center text-[10px] text-zinc-500 font-mono italic">
                    Tautan peta koordinat satelit belum disematkan pada properti ini.
                  </div>
                )}
              </div>

              {/* Consultation shortcut banner */}
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 flex items-start space-x-3 text-xs">
                <div className="p-2.5 bg-[#C9A961]/10 rounded-lg border border-[#C9A961]/20 mt-1">
                  <Sparkles className="h-4.5 w-4.5 text-[#C9A961]" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-[#C9A961] font-bold text-xs sm:text-sm">Konsultasikan Unit Ini Sekarang</p>
                  <p className="text-zinc-400 leading-relaxed text-[11px] sm:text-xs">
                    Tertarik dengan unit <span className="text-white font-semibold">{selectedDemoProperty.nama_property}</span>? Konsultan berlisensi kami siap menjadwalkan kunjungan lapangan privat atau mengirimkan berkas legalitas lengkap.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedDemoProperty(null);
                        navigate('/contact');
                      }}
                      className="cursor-pointer inline-flex items-center space-x-1 text-[#C9A961] hover:text-[#e5c47f] font-extrabold text-[12px] group"
                    >
                      <span>Kirim Inkuiri Kontak</span>
                      <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-zinc-800 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDemoProperty(null)}
                  className="rounded-xl border border-zinc-700 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50 px-5 py-3 text-xs font-bold transition-all duration-150 cursor-pointer"
                >
                  Tutup Detail
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  
    </div>
  );
}
