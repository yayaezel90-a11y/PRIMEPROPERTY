import { navigate, usePath } from '../lib/router.js';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Menu, X, Home, Compass, Phone, UserCheck } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo.js';

export default function Navbar() {
  const { pathname } = usePath();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { label: 'Beranda', path: '/', icon: Home },
    { label: 'Tentang Kami', path: '/about', icon: Compass },
    { label: 'Kontak', path: '/contact', icon: Phone }
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-brand-gold/15 bg-brand-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div 
          onClick={() => handleNav('/')}
          className="flex cursor-pointer items-center py-1 group"
        >
          <Logo size="sm" withWhiteBg={true} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`relative py-2 font-sans text-sm font-medium tracking-wide transition-all duration-200 ${
                isActive(item.path) 
                  ? 'text-brand-gold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
              {isActive(item.path) && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-gold"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Login Agent Button */}
        <div className="hidden items-center space-x-4 md:flex">
          <button
            onClick={() => handleNav('/agent/login')}
            className="border border-brand-gold bg-transparent px-4 py-1.5 rounded text-xs font-semibold text-brand-gold hover:bg-brand-gold hover:text-black transition-all cursor-pointer"
          >
            Login Agent
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-brand-gold/10 hover:text-white focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Reverted Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-b border-brand-gold/10 bg-[#1A1A1A]/95 backdrop-blur-md md:hidden px-4 pt-2 pb-4 space-y-1"
          >
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`block w-full text-left rounded-md px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${
                  isActive(item.path)
                    ? 'bg-brand-gold/15 text-brand-gold font-extrabold'
                    : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={() => handleNav('/agent/login')}
                className="block w-full text-center rounded border border-brand-gold bg-transparent py-2 text-xs font-bold text-brand-gold hover:bg-brand-gold hover:text-black transition-all cursor-pointer"
              >
                Login Agent
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
