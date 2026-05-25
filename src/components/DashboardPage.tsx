import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Search, Filter, RefreshCw, LogOut, ChevronDown, 
  Plus, CheckCircle, AlertTriangle, Play, HelpCircle, Archive, 
  History, Users, Sparkles, ChevronLeft, ChevronRight, X, ArrowUpDown, ChevronUp, MapPin
} from 'lucide-react';
import { Property, User } from '../types.js';
import { navigate, usePath } from '../lib/router.js';
import PropertyDrawer from './PropertyDrawer.js';
import AuditLogsTab from './AuditLogsTab.js';
import UserManagementTab from './UserManagementTab.js';
import ArchiveTab from './ArchiveTab.js';
import Logo from './Logo.js';

interface DashboardPageProps {
  currentUser: User | null;
  onLogout: () => void;
}

export default function DashboardPage({ currentUser, onLogout }: DashboardPageProps) {
  const { searchParams } = usePath();

  // Active Main Tab State: 'listing' | 'create' | 'archive' | 'audit' | 'users'
  const [activeTab, setActiveTab] = useState<'listing' | 'create' | 'archive' | 'audit' | 'users'>('listing');

  // Properties list and pagination
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Profile dropdown menu toggle
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Highlight tracking for newly created property
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);

  // Detail Drawer Target ID
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Filters State matching URL search parameters or standard defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  const [kawasan, setKawasan] = useState<string[]>(
    searchParams.getAll('kawasan').length > 0 ? searchParams.getAll('kawasan') : []
  );
  
  const [lebarMin, setLebarMin] = useState(searchParams.get('lebarMin') || '');
  
  const [hadap, setHadap] = useState<string[]>(
    searchParams.getAll('hadap').length > 0 ? searchParams.getAll('hadap') : []
  );
  
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  
  const [tipe, setTipe] = useState<'Semua' | 'Ruko' | 'Villa'>(
    (searchParams.get('tipe') as any) || 'Semua'
  );
  
  const [status, setStatus] = useState<'Semua' | 'in_stock' | 'sold_out'>(
    (searchParams.get('status') as any) || 'Semua'
  );
  
  const [siap, setSiap] = useState<string[]>(
    searchParams.getAll('siap').length > 0 ? searchParams.getAll('siap') : []
  );
  
  const [carport, setCarport] = useState<'Semua' | 'Ya' | 'Tidak'>(
    (searchParams.get('carport') as any) || 'Semua'
  );

  // Sorting and Pagination State details
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'nama');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1') || 1);
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '50') || 50);

  // New Property Form State (Superadmin)
  const [createForm, setCreateForm] = useState({
    nama_property: '',
    group: '',
    lebar: '',
    panjang: '',
    hadap: [] as string[],
    tipe: 'Ruko' as 'Ruko' | 'Villa',
    tingkat: '1.0',
    price: '',
    carport: false,
    status: 'in_stock' as 'in_stock' | 'sold_out',
    siap: 'siap_huni' as 'siap_huni' | 'siap_kosong' | 'siap_huni_renovasi',
    maps_link: '',
    kawasan: [] as string[],
    unit: ''
  });
  const [creationErrors, setCreationErrors] = useState<Record<string, string>>({});
  const [creationSuccess, setCreationSuccess] = useState('');
  const [creationSubmitting, setCreationSubmitting] = useState(false);

  // Reference list pointer to newly added properties row
  const newlyCreatedRowRef = useRef<HTMLTableRowElement>(null);

  // 1. Debounce Search Input (300ms) - (AC-7.2)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // 2. Sync State with URL Params dynamically - (AC-7.2)
  useEffect(() => {
    if (activeTab !== 'listing') return;

    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    kawasan.forEach((k) => params.append('kawasan', k));
    if (lebarMin) params.set('lebarMin', lebarMin);
    hadap.forEach((h) => params.append('hadap', h));
    if (priceMax) params.set('priceMax', priceMax);
    if (tipe !== 'Semua') params.set('tipe', tipe);
    if (status !== 'Semua') params.set('status', status);
    siap.forEach((s) => params.append('siap', s));
    if (carport !== 'Semua') params.set('carport', carport);
    
    params.set('sortBy', sortBy);
    params.set('sortDir', sortDir);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [
    debouncedSearch, kawasan, lebarMin, hadap, priceMax, tipe, 
    status, siap, carport, sortBy, sortDir, page, limit, activeTab
  ]);

  // 3. Main Data Lister Fetch
  const fetchPropertiesData = () => {
    if (activeTab !== 'listing') return;
    setLoading(true);

    const queryParams = new URLSearchParams();
    if (debouncedSearch) queryParams.set('search', debouncedSearch);
    kawasan.forEach((k) => queryParams.append('kawasan', k));
    if (lebarMin) queryParams.set('lebarMin', lebarMin);
    hadap.forEach((h) => queryParams.append('hadap', h));
    if (priceMax) queryParams.set('priceMax', priceMax);
    if (tipe !== 'Semua') queryParams.set('tipe', tipe);
    if (status !== 'Semua') queryParams.set('status', status);
    siap.forEach((s) => queryParams.append('siap', s));
    if (carport !== 'Semua') queryParams.set('carport', carport);

    queryParams.set('sortBy', sortBy);
    queryParams.set('sortDir', sortDir);
    queryParams.set('page', String(page));
    queryParams.set('limit', String(limit));

    const headers: Record<string, string> = {};
    if (currentUser) {
      headers['Authorization'] = `Bearer ${currentUser.id}`;
      headers['x-session-token'] = currentUser.id;
    }

    fetch(`/api/properties?${queryParams.toString()}`, { headers })
      .then((res) => {
        if (res.status === 401) {
          // auth expired, redirect to login
          onLogout();
          navigate('/agent/login');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        setProperties(data.properties || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch properties error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPropertiesData();
  }, [
    debouncedSearch, kawasan, lebarMin, hadap, priceMax, tipe, 
    status, siap, carport, sortBy, sortDir, page, limit, activeTab
  ]);

  // Handle auto scroll highlight
  useEffect(() => {
    if (highlightedPropertyId && properties.length > 0) {
      setTimeout(() => {
        if (newlyCreatedRowRef.current) {
          newlyCreatedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Fade out highlight background after 4s
        const timer = setTimeout(() => {
          setHighlightedPropertyId(null);
        }, 4000);
        return () => clearTimeout(timer);
      }, 300);
    }
  }, [highlightedPropertyId, properties]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setKawasan([]);
    setLebarMin('');
    setHadap([]);
    setPriceMax('');
    setTipe('Semua');
    setStatus('Semua');
    setSiap([]);
    setCarport('Semua');
    setSortBy('nama');
    setSortDir('asc');
    setPage(1);
  };

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // 4. Form Creation handler with validation (AC-8.1, AC-8.4)
  const validateCreationForm = () => {
    const errors: Record<string, string> = {};

    if (!createForm.nama_property || createForm.nama_property.trim().length < 3 || createForm.nama_property.trim().length > 100) {
      errors.nama_property = 'Nama properti harus diisi di antara 3 hingga 100 karakter.';
    }

    const priceNum = parseInt(createForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Harga wajib diisi dengan angka integer rupiah yang lebih besar dari 0.';
    }

    const lebarNum = parseFloat(createForm.lebar);
    if (isNaN(lebarNum) || lebarNum <= 0) {
      errors.lebar = 'Lebar wajib berupa numerik desimal yang lebih besar dari 0.';
    }

    const panjangNum = parseFloat(createForm.panjang);
    if (isNaN(panjangNum) || panjangNum <= 0) {
      errors.panjang = 'Panjang wajib berupa numerik desimal yang lebih besar dari 0.';
    }

    const tingkatNum = parseFloat(createForm.tingkat);
    if (isNaN(tingkatNum) || tingkatNum < 1 || tingkatNum > 10) {
      errors.tingkat = 'Jumlah tingkat lantai wajib di rentang 1 hingga 10 lantai.';
    }

    if (createForm.maps_link && createForm.maps_link.trim() !== '') {
      if (!createForm.maps_link.toLowerCase().includes('google.com/maps')) {
        errors.maps_link = 'Link Google Maps harus berupa URL lengkap berisi domain "google.com/maps"';
      }
    }

    if (createForm.kawasan.length === 0) {
      errors.kawasan = 'Tentukan minimal satu kawasan dari daftar lokasi.';
    }

    if (createForm.hadap.length === 0) {
      errors.hadap = 'Centang setidaknya satu arah hadap.';
    }

    setCreationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    setCreationErrors({});
    setCreationSuccess('');

    if (!validateCreationForm()) return;

    setCreationSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser) {
        headers['Authorization'] = `Bearer ${currentUser.id}`;
        headers['x-session-token'] = currentUser.id;
      }
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers,
        body: JSON.stringify(createForm)
      });

      const data = await res.json();
      if (!res.ok) {
        setCreationErrors({ general: data.error || 'Terjadi kesalahan sistem.' });
      } else {
        // Success created
        setCreationSuccess(`Properti "${data.nama_property}" berhasil ditambahkan!`);
        setHighlightedPropertyId(data.id);

        // Reset form variables
        setCreateForm({
          nama_property: '',
          group: '',
          lebar: '',
          panjang: '',
          hadap: [],
          tipe: 'Ruko',
          tingkat: '1.0',
          price: '',
          carport: false,
          status: 'in_stock',
          siap: 'siap_huni',
          maps_link: '',
          kawasan: [],
          unit: ''
        });

        if (!addAnother) {
          // Redirect with scroll highlights
          setTimeout(() => {
            setActiveTab('listing');
          }, 1500);
        }
      }
    } catch (err) {
      console.error(err);
      setCreationErrors({ general: 'Terjadi pemutusan masalah jaringan internet.' });
    } finally {
      setCreationSubmitting(false);
    }
  };

  const handleFormHadapToggle = (dir: string) => {
    const current = [...createForm.hadap];
    const idx = current.indexOf(dir);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(dir);
    }
    setCreateForm((prev) => ({ ...prev, hadap: current }));
  };

  const handleFormKawasanToggle = (kws: string) => {
    const current = [...createForm.kawasan];
    const idx = current.indexOf(kws);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(kws);
    }
    setCreateForm((prev) => ({ ...prev, kawasan: current }));
  };

  // Handle trigger logout cookie clear
  const handlePerformLogout = async () => {
    try {
      const headers: Record<string, string> = {};
      if (currentUser) {
        headers['Authorization'] = `Bearer ${currentUser.id}`;
        headers['x-session-token'] = currentUser.id;
      }
      await fetch('/api/auth/logout', { method: 'POST', headers });
    } catch (e) {
      console.error(e);
    }
    onLogout();
    navigate('/agent/login');
  };

  // Chip listing helpers
  const removeKawasanChip = (item: string) => {
    setKawasan((prev) => prev.filter((k) => k !== item));
    setPage(1);
  };

  const removeHadapChip = (item: string) => {
    setHadap((prev) => prev.filter((h) => h !== item));
    setPage(1);
  };

  const removeSiapChip = (item: string) => {
    setSiap((prev) => prev.filter((s) => s !== item));
    setPage(1);
  };

  const hasActiveFilters = () => {
    return (
      debouncedSearch !== '' ||
      kawasan.length > 0 ||
      lebarMin !== '' ||
      hadap.length > 0 ||
      priceMax !== '' ||
      tipe !== 'Semua' ||
      status !== 'Semua' ||
      siap.length > 0 ||
      carport !== 'Semua'
    );
  };

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans flex flex-col">
      
      {/* 1. STICKY DASHBOARD HEADER TOOLBAR */}
      <header className="sticky top-0 z-30 w-full border-b border-brand-gold/15 bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            onClick={() => {
              setActiveTab('listing');
              setSelectedPropertyId(null);
            }}
            className="flex cursor-pointer items-center py-1 group"
          >
            <Logo size="sm" withWhiteBg={true} />
            <span className="hidden sm:inline-block ml-3 rounded bg-zinc-900 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-800 leading-none">
              PORTAL
            </span>
          </div>
          <span className="text-[9px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/20 font-mono font-bold uppercase select-none tracking-wide text-[#C9A961]">
            {currentUser?.role}
          </span>
        </div>

        {/* User profile actions widget drop */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 text-xs font-semibold hover:text-brand-gold transition-colors focus:outline-none"
          >
            <div className="h-7 w-7 rounded-full bg-brand-gold text-black flex items-center justify-center font-bold font-sans uppercase">
              {currentUser?.email.substring(0, 2)}
            </div>
            <span className="hidden sm:inline-block truncate max-w-xs">{currentUser?.email}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                {/* Overlay backing clicking outside to close */}
                <div onClick={() => setShowProfileMenu(false)} className="fixed inset-0 z-10" />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-2 z-20 w-48 rounded bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden font-mono text-[11px]"
                >
                  <div className="px-4 py-3 bg-zinc-950/60 border-b border-zinc-800 text-zinc-500">
                    Akun: <span className="text-gray-200 block truncate font-sans">{currentUser?.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handlePerformLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-brand-red/10 cursor-pointer flex items-center space-x-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="font-sans font-bold">Logout Agen</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 2. SUB NAVIGATION BAR SYSTEM */}
      <div className="border-b border-zinc-800/80 bg-zinc-950 px-4 sm:px-6 py-2.5 flex items-center overflow-x-auto space-x-2 shrink-0 select-none">
        <button
          onClick={() => {
            setActiveTab('listing');
            setSelectedPropertyId(null);
          }}
          className={`px-4 py-2 text-xs font-bold tracking-wide rounded-md flex items-center space-x-2 transition-all duration-150 cursor-pointer ${
            activeTab === 'listing' 
              ? 'bg-gradient-to-r from-brand-gold to-[#bda05d] text-black shadow-md shadow-brand-gold/5 font-extrabold' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Building2 className={`h-3.5 w-3.5 ${activeTab === 'listing' ? 'text-black' : 'text-brand-gold'}`} />
          <span>Listing Properti</span>
        </button>

        {/* Superadmin only Tab items */}
        {currentUser?.role === 'superadmin' && (
          <>
            <button
              onClick={() => {
                setActiveTab('create');
                setSelectedPropertyId(null);
                setCreationErrors({});
                setCreationSuccess('');
              }}
              className={`px-4 py-2 text-xs font-bold tracking-wide rounded-md flex items-center space-x-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'create' 
                  ? 'bg-gradient-to-r from-brand-gold to-[#bda05d] text-black shadow-md shadow-brand-gold/5 font-extrabold' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Plus className={`h-3.5 w-3.5 ${activeTab === 'create' ? 'text-black' : 'text-brand-gold'}`} />
              <span>Tambah Properti</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('users');
                setSelectedPropertyId(null);
              }}
              className={`px-4 py-2 text-xs font-bold tracking-wide rounded-md flex items-center space-x-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'users' 
                  ? 'bg-gradient-to-r from-brand-gold to-[#bda05d] text-black shadow-md shadow-brand-gold/5 font-extrabold' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Users className={`h-3.5 w-3.5 ${activeTab === 'users' ? 'text-black' : 'text-[#C9A961]'}`} />
              <span>Daftar Akun</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('archive');
                setSelectedPropertyId(null);
              }}
              className={`px-4 py-2 text-xs font-bold tracking-wide rounded-md flex items-center space-x-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'archive' 
                  ? 'bg-gradient-to-r from-brand-gold to-[#bda05d] text-black shadow-md shadow-brand-gold/5 font-extrabold' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Archive className={`h-3.5 w-3.5 ${activeTab === 'archive' ? 'text-black' : 'text-[#C9A961]'}`} />
              <span>Arsip Unit</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('audit');
                setSelectedPropertyId(null);
              }}
              className={`px-4 py-2 text-xs font-bold tracking-wide rounded-md flex items-center space-x-2 transition-all duration-150 cursor-pointer ${
                activeTab === 'audit' 
                  ? 'bg-gradient-to-r from-brand-gold to-[#bda05d] text-black shadow-md shadow-brand-gold/5 font-extrabold' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <History className={`h-3.5 w-3.5 ${activeTab === 'audit' ? 'text-black' : 'text-[#C9A961]'}`} />
              <span>Audit Log</span>
            </button>
          </>
        )}
      </div>

      {/* 3. CORE ACTIVE PAGE DISPLAY CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {activeTab === 'listing' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-full pb-12">
            
            {/* 3.1 FILTER PANEL - LEFT SIDEBAR (AC-7.2) */}
            <div className="xl:col-span-1 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 space-y-5 h-fit text-left">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4.5 w-4.5 text-brand-gold" />
                  <span className="text-sm font-bold uppercase tracking-wider text-gray-200">Panel Saring</span>
                </div>
                {hasActiveFilters() && (
                  <button
                    onClick={handleResetFilters}
                    className="cursor-pointer text-[10px] font-bold text-xs text-brand-red font-semibold hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Input Search Form bar */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono">
                  Pencarian Bebas
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ketik nama, grup, kawasan..."
                    className="w-full rounded bg-brand-black border border-zinc-800 text-xs text-white pl-9 pr-3 py-2 focus:border-brand-gold/50 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Kawasan multi dropdown */}
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono">
                  Kawasan Lokasi
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Krakatau', 'Pancing', 'Cemara Asri/Kuala', 'Tembung', 'Helvetia'].map((kws) => {
                    const active = kawasan.includes(kws);
                    return (
                      <button
                        key={kws}
                        onClick={() => {
                          setKawasan((prev) => 
                            prev.includes(kws) ? prev.filter((x) => x !== kws) : [...prev, kws]
                          );
                          setPage(1);
                        }}
                        className={`px-2 py-1 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                          active 
                            ? 'bg-brand-gold/15 border-brand-gold text-brand-gold' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {kws}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipe Radio options (Semua / Ruko / Villa) */}
              <div className="space-y-1 border-t border-zinc-800/80 pt-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono mb-2">
                  Tipe Properti
                </label>
                <div className="flex flex-col space-y-1.5 text-xs text-zinc-300">
                  {['Semua', 'Ruko', 'Villa'].map((t) => (
                    <label key={t} className="flex items-center space-x-2 cursor-pointer hover:text-white select-none">
                      <input
                        type="radio"
                        name="listing-tipe"
                        checked={tipe === t}
                        onChange={() => {
                          setTipe(t as any);
                          setPage(1);
                        }}
                        className="accent-brand-gold"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Radio options (Semua / In Stock / Sold Out) */}
              <div className="space-y-1 border-t border-zinc-800/80 pt-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono mb-2">
                  Status Penjualan
                </label>
                <div className="flex flex-col space-y-1.5 text-xs text-zinc-300">
                  {['Semua', 'in_stock', 'sold_out'].map((st) => (
                    <label key={st} className="flex items-center space-x-2 cursor-pointer hover:text-white select-none">
                      <input
                        type="radio"
                        name="listing-status"
                        checked={(st === 'in_stock' && status === 'in_stock') || (st === 'sold_out' && status === 'sold_out') || (st === 'Semua' && status === 'Semua')}
                        onChange={() => {
                          setStatus(st as any);
                          setPage(1);
                        }}
                        className="accent-brand-gold"
                      />
                      <span>{st === 'Semua' ? 'Tampilkan Semua' : st === 'in_stock' ? 'In Stock (Tersedia)' : 'Sold Out (Terjual)'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Min Width input numeric */}
              <div className="space-y-1 border-t border-zinc-800/80 pt-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono">
                  Lebar Tanah Minimal (meter)
                </label>
                <input
                  type="number"
                  value={lebarMin}
                  onChange={(e) => {
                    setLebarMin(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Min Lebar, cth: 6"
                  className="w-full rounded bg-brand-black border border-zinc-800 text-xs text-white pl-3 pr-3 py-2 focus:border-brand-gold/50 focus:outline-none"
                />
              </div>

              {/* Max Price input numeric */}
              <div className="space-y-1 border-t border-zinc-800/80 pt-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono">
                  Harga Maksimal (Rupiah)
                </label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Batas Harga, cth: 2000000000"
                  className="w-full rounded bg-brand-black border border-zinc-800 text-s text-white pl-3 pr-3 py-2 text-xs focus:border-brand-gold/50 focus:outline-none"
                />
                {priceMax && (
                  <span className="text-[10px] text-brand-gold font-mono block text-right mt-1">
                    {formatRupiah(Number(priceMax))}
                  </span>
                )}
              </div>

              {/* Hadap Multi selectors */}
              <div className="space-y-1 border-t border-zinc-800/80 pt-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono mb-2">
                  Arah Hadap Bangunan
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Utara', 'Selatan', 'Timur', 'Barat'].map((dir) => {
                    const active = hadap.includes(dir);
                    return (
                      <button
                        key={dir}
                        onClick={() => {
                          setHadap((prev) => 
                            prev.includes(dir) ? prev.filter((x) => x !== dir) : [...prev, dir]
                          );
                          setPage(1);
                        }}
                        className={`px-2 py-1 text-[10px] font-semibold rounded border cursor-pointer transition-colors ${
                          active 
                            ? 'bg-brand-gold/15 border-brand-gold text-brand-gold' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {dir}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Siap Multi-select dropdown chips */}
              <div className="space-y-1 border-t border-zinc-800/80 pt-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono mb-2">
                  Kesiapan Hunian
                </label>
                <div className="flex flex-col space-y-1.5 text-xs text-zinc-300">
                  {[
                    { key: 'siap_huni', val: 'Siap Huni' },
                    { key: 'siap_kosong', val: 'Siap Kosong' },
                    { key: 'siap_huni_renovasi', val: 'Siap Huni (Renovasi)' }
                  ].map((s) => {
                    const checked = siap.includes(s.key);
                    return (
                      <label key={s.key} className="flex items-center space-x-2 cursor-pointer hover:text-white select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSiap((prev) => 
                              prev.includes(s.key) ? prev.filter((v) => v !== s.key) : [...prev, s.key]
                            );
                            setPage(1);
                          }}
                          className="accent-brand-gold rounded"
                        />
                        <span>{s.val}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Carport Toggle buttons */}
              <div className="space-y-1 border-t border-zinc-800/80 pt-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono mb-2">
                  Memiliki Carport / Garasian
                </label>
                <div className="flex bg-brand-black p-0.5 rounded border border-zinc-800 text-[11px] font-mono">
                  {['Semua', 'Ya', 'Tidak'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCarport(c as any);
                        setPage(1);
                      }}
                      className={`flex-1 text-center py-1 rounded select-none cursor-pointer ${
                        carport === c ? 'bg-brand-gold text-black font-semibold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 3.2 MAIN TABLE BOARD LAYOUT - RIGHT CONTAINER */}
            <div className="xl:col-span-3 space-y-4">
              
              {/* BRANDED QUICK STATS BOARD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stat 1: Total Unit */}
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 text-left flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-brand-gold/30 transition-all duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">TOTAL LISTING PORTAL</span>
                    <h3 className="text-2xl font-black text-white">{totalCount} <span className="text-xs font-normal text-zinc-400 font-sans">Unit</span></h3>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>

                {/* Stat 2: Active Search Matches */}
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 text-left flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-brand-gold/30 transition-all duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">TERFILTER SAAT INI</span>
                    <h3 className="text-2xl font-black text-[#C9A961]">{properties.length} <span className="text-xs font-normal text-zinc-300 font-sans">Unit</span></h3>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-brand-gold/10 flex items-center justify-center text-[#C9A961]">
                    <Filter className="h-4.5 w-4.5" />
                  </div>
                </div>

                {/* Stat 3: Limit Actions */}
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 text-left flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-brand-gold/30 transition-all duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">PEMBATASAN TAMPILAN</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="bg-zinc-950 border border-zinc-800 text-xs text-white rounded px-2.5 py-1 focus:outline-none focus:border-brand-gold whitespace-nowrap"
                      >
                        <option value="25">25 Baris</option>
                        <option value="50">50 Baris</option>
                        <option value="100">100 Baris</option>
                      </select>
                      <span className="text-[11px] text-zinc-400">per Hal.</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-zinc-800/50 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Filter chips tray (AC-7.2) */}
              {hasActiveFilters() && (
                <div className="flex flex-wrap gap-2 items-center bg-zinc-900/10 p-2.5 rounded border border-dashed border-zinc-800 text-left">
                  <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase shrink-0 mr-1.5">Saring Aktif:</span>
                  
                  {debouncedSearch && (
                    <span className="inline-flex items-center space-x-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-gray-200">
                      <span>Cari: "{debouncedSearch}"</span>
                      <button onClick={() => setSearch('')} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                    </span>
                  )}

                  {kawasan.map((k) => (
                    <span key={k} className="inline-flex items-center space-x-1 rounded bg-brand-gold/10 px-2 py-0.5 text-[10px] font-semibold text-[#C9A961] border border-brand-gold/20">
                      <span>{k}</span>
                      <button onClick={() => removeKawasanChip(k)} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                    </span>
                  ))}

                  {lebarMin && (
                    <span className="inline-flex items-center space-x-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-gray-200">
                      <span>Lebar &ge; {lebarMin}m</span>
                      <button onClick={() => setLebarMin('')} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                    </span>
                  )}

                  {priceMax && (
                    <span className="inline-flex items-center space-x-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-gray-200">
                      <span>Harga &le; {formatRupiah(Number(priceMax))}</span>
                      <button onClick={() => setPriceMax('')} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                    </span>
                  )}

                  {hadap.map((h) => (
                    <span key={h} className="inline-flex items-center space-x-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-gray-200">
                      <span>Hadap {h}</span>
                      <button onClick={() => removeHadapChip(h)} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                    </span>
                  ))}

                  {tipe !== 'Semua' && (
                    <span className="inline-flex items-center space-x-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      <span>Tipe: {tipe}</span>
                      <button onClick={() => setTipe('Semua')} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                    </span>
                  )}

                  {status !== 'Semua' && (
                    <span className="inline-flex items-center space-x-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      <span>Status: {status === 'in_stock' ? 'In Stock' : 'Sold Out'}</span>
                      <button onClick={() => setStatus('Semua')} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                    </span>
                  )}

                  {siap.map((s) => (
                    <span key={s} className="inline-flex items-center space-x-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      <span>
                        {s === 'siap_huni' && 'Siap Huni'}
                        {s === 'siap_kosong' && 'Siap Kosong'}
                        {s === 'siap_huni_renovasi' && 'Perlu Renovasi'}
                      </span>
                      <button onClick={() => removeSiapChip(s)} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                    </span>
                  ))}

                  {carport !== 'Semua' && (
                    <span className="inline-flex items-center space-x-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      <span>Garasi: {carport}</span>
                      <button onClick={() => setCarport('Semua')} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                    </span>
                  )}

                  <button
                    onClick={handleResetFilters}
                    className="text-[9px] font-extrabold uppercase font-mono tracking-wider text-brand-red ml-auto hover:underline cursor-pointer"
                  >
                    Reset Semua
                  </button>
                </div>
              )}

              {/* TABLE LISTING WRAPPER (AC-7.1) */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-zinc-900/10 rounded-xl border border-zinc-800">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
                  <p className="text-xs text-zinc-500 font-mono">Menyelaraskan data properti...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-16 text-center text-zinc-500 text-xs">
                  Tidak ada listing properti aktif yang memenuhi kriteria filter saat ini.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#1e1e1e]/60 shadow-xl">
                  <table className="w-full border-collapse text-left text-xs text-zinc-300 font-sans">
                    <thead className="bg-[#121212] border-b border-zinc-800 text-[9px] font-bold uppercase tracking-wider text-brand-gold">
                      <tr>
                        {/* Interactive Clickable Sporters */}
                        <th 
                          onClick={() => handleSortToggle('nama')}
                          className="px-4 py-3.5 cursor-pointer hover:bg-zinc-900/30 select-none whitespace-nowrap"
                        >
                          <div className="flex items-center space-x-1.5">
                            <span>Nama Properti</span>
                            {sortBy === 'nama' && (
                              sortDir === 'asc' ? <ArrowUpDown className="h-3 w-3 text-brand-gold" /> : <ChevronDown className="h-3 w-3 text-brand-gold" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3.5">Group</th>
                        <th className="px-4 py-3.5">Ukuran Bidang (L x P)</th>
                        <th className="px-4 py-3.5">Hadap</th>
                        <th className="px-4 py-3.5">Tipe</th>
                        <th className="px-4 py-3.5">Lt. Belaka</th>
                        
                        <th 
                          onClick={() => handleSortToggle('harga')}
                          className="px-4 py-3.5 cursor-pointer hover:bg-zinc-900/30 select-none whitespace-nowrap"
                        >
                          <div className="flex items-center space-x-1.5">
                            <span>Harga (Rupiah)</span>
                            {sortBy === 'harga' && (
                              sortDir === 'asc' ? <ArrowUpDown className="h-3 w-3 text-brand-gold" /> : <ChevronDown className="h-3 w-3 text-brand-gold" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3.5">Carport</th>
                        
                        <th 
                          onClick={() => handleSortToggle('status')}
                          className="px-4 py-3.5 cursor-pointer hover:bg-zinc-900/30 select-none"
                        >
                          <div className="flex items-center space-x-1.5">
                            <span>Status</span>
                            {sortBy === 'status' && (
                              sortDir === 'asc' ? <ArrowUpDown className="h-3 w-3 text-brand-gold" /> : <ChevronDown className="h-3 w-3 text-brand-gold" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3.5">Kesiapan</th>
                        <th className="px-4 py-3.5">Kawasan</th>
                        <th className="px-4 py-3.5 text-right font-sans">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {properties.map((p) => {
                        const isHighlighted = highlightedPropertyId === p.id;
                        return (
                          <tr
                            key={p.id}
                            ref={isHighlighted ? newlyCreatedRowRef : undefined}
                            onClick={() => setSelectedPropertyId(p.id)}
                            className={`cursor-pointer transition-all group ${
                              isHighlighted 
                                ? 'bg-brand-gold/15 border-brand-gold border-2 animate-pulse' 
                                : 'hover:bg-zinc-800/45'
                            }`}
                          >
                            <td className="px-4 py-4">
                              <span className="font-bold text-gray-100 block">{p.nama_property}</span>
                              <span className="text-[9px] text-zinc-600 font-mono block mt-0.5">{p.id}</span>
                            </td>
                            <td className="px-4 py-4 text-zinc-400 font-medium">
                              {p.group || '-'}
                            </td>
                            <td className="px-4 py-4 font-mono text-zinc-400">
                              {p.lebar} m x {p.panjang} m
                            </td>
                            <td className="px-4 py-4 text-xs">
                              {p.hadap.join(', ') || '-'}
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-semibold text-zinc-200 block">{p.tipe}</span>
                            </td>
                            <td className="px-4 py-4 font-mono text-zinc-400">
                              {p.tingkat}
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-brand-gold font-sans whitespace-nowrap">
                              {formatRupiah(p.price)}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-[10px] uppercase font-bold ${p.carport ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                {p.carport ? 'ADA' : 'TDK'}
                              </span>
                            </td>
                            {/* Status and Siap Badges styled according to AC-7.1 color guide specifications */}
                            <td className="px-4 py-4">
                              {p.status === 'in_stock' ? (
                                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                                  In Stock
                                </span>
                              ) : (
                                <span className="rounded bg-[#B33A3A] px-2 py-0.5 text-[10px] font-semibold text-white uppercase whitespace-nowrap">
                                  Sold Out
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {p.siap === 'siap_huni' && (
                                <span className="rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                                  Siap Huni
                                </span>
                              )}
                              {p.siap === 'siap_kosong' && (
                                <span className="rounded bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                                  Siap Kosong
                                </span>
                              )}
                              {p.siap === 'siap_huni_renovasi' && (
                                <span className="rounded bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                                  Perlu Renovasi
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-zinc-400">
                              {p.kawasan.join(', ')}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="inline-flex items-center space-x-1 rounded bg-brand-gold/15 px-2.5 py-1 text-[11px] font-bold text-[#C9A961] border border-brand-gold/35 group-hover:bg-brand-gold group-hover:text-black transition-all duration-250 shrink-0">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span>Kelola / Edit</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PAGINATION NUMBERS (AC-7.1) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between col-span-full pt-4 font-mono text-xs">
                  <span className="text-zinc-500">
                    Halaman <span className="text-brand-gold">{page}</span> dari <span className="text-brand-gold">{totalPages}</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      className="rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed p-1.5 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPage(idx + 1)}
                        className={`px-3 py-1.5 rounded transition-all select-none cursor-pointer ${
                          page === idx + 1 
                            ? 'bg-brand-gold text-black font-semibold' 
                            : 'border border-zinc-800 bg-transparent text-zinc-400 hover:text-white'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      className="rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed p-1.5 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ----------------- CREATE NEW PROPERTY TAB - SUPERADMIN (AC-8.1, AC-8.4) ----------------- */}
        {activeTab === 'create' && currentUser?.role === 'superadmin' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-zinc-900/40 p-6 sm:p-8 rounded-xl border border-brand-gold/15 text-left space-y-6"
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C9A961] font-bold font-mono">PANEL SUPERVISI EKSTRAPOLASI</span>
              <h2 className="text-xl font-black text-gray-200 mt-1 uppercase">Tambah Properti Baru</h2>
              <p className="text-xs text-zinc-500 mt-1">Daftarkan ruko komersial atau villa baru ke database secara instan.</p>
            </div>

            <form onSubmit={(e) => handleCreateSubmit(e, false)} className="space-y-6">
              
              {creationErrors.general && (
                <div className="rounded-md bg-brand-red/10 border border-brand-red/25 p-4 text-xs text-brand-red flex items-start space-x-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{creationErrors.general}</span>
                </div>
              )}

              {creationSuccess && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/25 p-4 text-xs text-emerald-400 flex items-start space-x-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{creationSuccess}</span>
                </div>
              )}

              {/* Grid 2 Column form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nama property (wajib) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Nama Properti Lengkap <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.nama_property}
                    onChange={(e) => {
                      setCreateForm((p) => ({ ...p, nama_property: e.target.value }));
                      if (creationErrors.nama_property) setCreationErrors((p) => ({ ...p, nama_property: '' }));
                    }}
                    placeholder="Contoh: Krakatau Mansion Suite"
                    className="w-full rounded bg-brand-black border border-zinc-800 px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                  {creationErrors.nama_property && (
                    <span className="text-[11px] text-brand-red font-mono mt-1 block">{creationErrors.nama_property}</span>
                  )}
                </div>

                {/* Group (nullable) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Cluster / Sektor / Blok
                  </label>
                  <input
                    type="text"
                    value={createForm.group}
                    onChange={(e) => setCreateForm((p) => ({ ...p, group: e.target.value }))}
                    placeholder="Contoh: Sektor 3-A, Blok B"
                    className="w-full rounded bg-brand-black border border-zinc-800 px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                </div>

                {/* Unit (nullable) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Nomor Unit Kavling
                  </label>
                  <input
                    type="text"
                    value={createForm.unit}
                    onChange={(e) => setCreateForm((p) => ({ ...p, unit: e.target.value }))}
                    placeholder="Contoh: B-12"
                    className="w-full rounded bg-brand-black border border-zinc-800 px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                </div>

                {/* Price (Int rupiah) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Harga Jual Properti (Rp) <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={createForm.price}
                    onChange={(e) => {
                      setCreateForm((p) => ({ ...p, price: e.target.value }));
                      if (creationErrors.price) setCreationErrors((p) => ({ ...p, price: '' }));
                    }}
                    placeholder="Cth: 1350000000 (Integer)"
                    className="w-full rounded bg-brand-black border border-zinc-800 px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                  {createForm.price && (
                    <span className="text-[10px] text-brand-gold font-mono block text-right mt-1">
                      Nilai: {formatRupiah(Number(createForm.price))}
                    </span>
                  )}
                  {creationErrors.price && (
                    <span className="text-[11px] text-brand-red font-mono mt-1 block">{creationErrors.price}</span>
                  )}
                </div>

                {/* Tipe Radio (Ruko / Villa) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Tipe Properti <span className="text-brand-gold">*</span>
                  </label>
                  <div className="flex space-x-6 py-2">
                    {['Ruko', 'Villa'].map((t) => (
                      <label key={t} className="flex items-center space-x-2 text-sm cursor-pointer select-none">
                        <input
                          type="radio"
                          name="form-tipe"
                          checked={createForm.tipe === t}
                          onChange={() => setCreateForm((p) => ({ ...p, tipe: t as any }))}
                          className="accent-brand-gold font-mono"
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Lebar */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Lebar Tanah (meter) <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={createForm.lebar}
                    onChange={(e) => {
                      setCreateForm((p) => ({ ...p, lebar: e.target.value }));
                      if (creationErrors.lebar) setCreationErrors((p) => ({ ...p, lebar: '' }));
                    }}
                    placeholder="Masukkan lebar properti dalam M"
                    className="w-full rounded bg-brand-black border border-zinc-800 px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                  {creationErrors.lebar && (
                    <span className="text-[11px] text-brand-red font-mono mt-1 block">{creationErrors.lebar}</span>
                  )}
                </div>

                {/* Panjang */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Panjang Tanah (meter) <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={createForm.panjang}
                    onChange={(e) => {
                      setCreateForm((p) => ({ ...p, panjang: e.target.value }));
                      if (creationErrors.panjang) setCreationErrors((p) => ({ ...p, panjang: '' }));
                    }}
                    placeholder="Masukkan panjang properti dalam M"
                    className="w-full rounded bg-brand-black border border-zinc-800 px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                  {creationErrors.panjang && (
                    <span className="text-[11px] text-brand-red font-mono mt-1 block">{creationErrors.panjang}</span>
                  )}
                </div>

                {/* Tingkat */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Jumlah Tingkat Lantai <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={createForm.tingkat}
                    onChange={(e) => {
                      setCreateForm((p) => ({ ...p, tingkat: e.target.value }));
                      if (creationErrors.tingkat) setCreationErrors((p) => ({ ...p, tingkat: '' }));
                    }}
                    placeholder="Contoh: 2.0"
                    className="w-full rounded bg-brand-black border border-zinc-800 px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                  {creationErrors.tingkat && (
                    <span className="text-[11px] text-brand-red font-mono mt-1 block">{creationErrors.tingkat}</span>
                  )}
                </div>

                {/* Carport Toggle Checkbox */}
                <div className="flex items-center h-full sm:pt-4">
                  <label className="flex items-center space-x-3 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={createForm.carport}
                      onChange={(e) => setCreateForm((p) => ({ ...p, carport: e.target.checked }))}
                      className="accent-brand-gold h-4 w-4 rounded"
                    />
                    <span className="font-semibold text-gray-300">Memiliki Garasi / Carport</span>
                  </label>
                </div>

                {/* Siap state */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Kesiapan Konstruksi <span className="text-brand-gold">*</span>
                  </label>
                  <select
                    value={createForm.siap}
                    onChange={(e) => setCreateForm((p) => ({ ...p, siap: e.target.value as any }))}
                    className="w-full rounded bg-brand-black border border-zinc-800 px-3 py-2 text-sm text-[#C9A961] focus:border-brand-gold focus:outline-none"
                  >
                    <option value="siap_huni">Siap Huni</option>
                    <option value="siap_kosong">Siap Kosong</option>
                    <option value="siap_huni_renovasi">Siap Huni (Perlu Renovasi)</option>
                  </select>
                </div>

                {/* status state */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Status Penjualan Awal <span className="text-brand-gold">*</span>
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value as any }))}
                    className="w-full rounded bg-brand-black border border-zinc-800 px-3 py-2 text-sm text-[#C9A961] focus:border-brand-gold focus:outline-none"
                  >
                    <option value="in_stock">In Stock (Tersedia)</option>
                    <option value="sold_out">Sold Out (Terjual)</option>
                  </select>
                </div>

                {/* Hadap multi checkers */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Arah Hadap Bangunan <span className="text-brand-gold">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4 py-1">
                    {['Utara', 'Selatan', 'Timur', 'Barat'].map((dir) => {
                      const checked = createForm.hadap.includes(dir);
                      return (
                        <label key={dir} className="flex items-center space-x-2 text-sm cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              handleFormHadapToggle(dir);
                              if (creationErrors.hadap) setCreationErrors((p) => ({ ...p, hadap: '' }));
                            }}
                            className="accent-brand-gold rounded"
                          />
                          <span>{dir}</span>
                        </label>
                      );
                    })}
                  </div>
                  {creationErrors.hadap && (
                    <span className="text-[11px] text-brand-red font-mono block mt-1">{creationErrors.hadap}</span>
                  )}
                </div>

                {/* Kawasan multi badges */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Kawasan Lokasi (Kategori Kota) <span className="text-brand-gold">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3 py-1">
                    {['Krakatau', 'Pancing', 'Cemara Asri/Kuala', 'Tembung', 'Helvetia'].map((kws) => {
                      const checked = createForm.kawasan.includes(kws);
                      return (
                        <button
                          key={kws}
                          type="button"
                          onClick={() => {
                            handleFormKawasanToggle(kws);
                            if (creationErrors.kawasan) setCreationErrors((p) => ({ ...p, kawasan: '' }));
                          }}
                          className={`px-3 py-1 text-xs rounded border cursor-pointer transition-colors ${
                            checked 
                              ? 'bg-brand-gold/15 border-brand-gold text-brand-gold animate-pulse-slow' 
                              : 'bg-brand-black/40 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {kws}
                        </button>
                      );
                    })}
                  </div>
                  {creationErrors.kawasan && (
                    <span className="text-[11px] text-brand-red font-mono block mt-1">{creationErrors.kawasan}</span>
                  )}
                </div>

                {/* Google Maps link */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Tautan Direktori Lokasi Google Maps
                  </label>
                  <input
                    type="text"
                    value={createForm.maps_link}
                    onChange={(e) => {
                      setCreateForm((p) => ({ ...p, maps_link: e.target.value }));
                      if (creationErrors.maps_link) setCreationErrors((p) => ({ ...p, maps_link: '' }));
                    }}
                    placeholder="https://www.google.com/maps/place/..."
                    className="w-full rounded bg-brand-black border border-zinc-800 px-4 py-2 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                  {creationErrors.maps_link && (
                    <span className="text-[11px] text-brand-red font-mono mt-1 block">{creationErrors.maps_link}</span>
                  )}
                </div>

              </div>

              {/* Form submit actions including Save & Add more (AC-8.1) */}
              <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-end gap-3 font-sans shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('listing')}
                  className="w-full sm:w-auto rounded border border-zinc-700 hover:bg-zinc-800 px-5 py-3 text-xs font-semibold text-zinc-400"
                >
                  Batal Pembuatan
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreateSubmit(e, true)}
                  disabled={creationSubmitting}
                  className="w-full sm:w-auto rounded border border-[#C9A961]/50 hover:bg-[#C9A961]/10 text-brand-gold px-5 py-3 text-xs font-semibold font-sans tracking-wide"
                >
                  Simpan & Tambah Lagi
                </button>
                <button
                  type="submit"
                  disabled={creationSubmitting}
                  className="w-full sm:w-auto rounded bg-brand-gold hover:bg-[#b09355] text-black px-6 py-3 text-xs font-semibold font-sans tracking-wide disabled:opacity-50"
                >
                  {creationSubmitting ? 'Menyimpan...' : 'Simpan Properti Utama'}
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* --- SYSTEM ADMINISTRATOR MEMBERS CONFIG (AC-5.2) --- */}
        {activeTab === 'users' && currentUser?.role === 'superadmin' && (
          <UserManagementTab />
        )}

        {/* --- RECOVERY ARCHIVE CONTROL SCREEN (AC-8.3) --- */}
        {activeTab === 'archive' && currentUser?.role === 'superadmin' && (
          <ArchiveTab onRestoreSuccess={fetchPropertiesData} />
        )}

        {/* --- HISTORIC AUDIT TRAIL DATA LISTER (AC-5.2) --- */}
        {activeTab === 'audit' && currentUser?.role === 'superadmin' && (
          <AuditLogsTab />
        )}

      </main>

      {/* 4. DETAILS DRAWER RIGHT-SIDE POPUP OVERLAY */}
      <AnimatePresence>
        {selectedPropertyId && (
          <PropertyDrawer
            propertyId={selectedPropertyId}
            currentUser={currentUser}
            onClose={() => setSelectedPropertyId(null)}
            onUpdateSuccess={fetchPropertiesData}
            onDeleteSuccess={fetchPropertiesData}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
