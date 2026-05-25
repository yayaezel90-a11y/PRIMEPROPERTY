import { navigate } from '../lib/router.js';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import Logo from './Logo.js';

export default function Footer() {
  return (
    <footer className="border-t border-brand-gold/15 bg-brand-black py-12 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* Column 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Logo size="sm" withWhiteBg={true} />
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Menyediakan hunian mewah, eksklusif, dan strategis di Indonesia. Berkomitmen menghadirkan layanan real estate dengan integritas serta harga terbaik sejak 2015.
            </p>
          </div>

          {/* Column 2: Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-brand-gold uppercase">
              Tautan Cepat
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => navigate('/')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/about')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Tentang Kami
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/contact')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Hubungi Kontak
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-brand-gold uppercase">
              Kontak Kantor
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-brand-gold shrink-0" />
                <span>(021) 12345678</span>
              </li>
              <li className="flex items-center space-x-3">
                <MessageSquare className="h-4 w-4 text-brand-gold shrink-0" />
                <a 
                  href="https://wa.me/628123456789" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  +62 812-3456-789 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-brand-gold shrink-0" />
                <a 
                  href="mailto:info@primeproperty.com" 
                  className="hover:text-white transition-colors"
                >
                  info@primeproperty.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 border-t border-zinc-800 pt-8 text-center text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Prime Property. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="text-[10px] tracking-wider uppercase text-zinc-700">
            Premium Real Estate &bull; Jakarta, Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
