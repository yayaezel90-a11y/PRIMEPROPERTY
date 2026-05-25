import { useEffect, useState } from 'react';
import { usePath, navigate } from './lib/router.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import LandingPage from './components/LandingPage.js';
import AboutPage from './components/AboutPage.js';
import ContactPage from './components/ContactPage.js';
import AgentLoginPage from './components/AgentLoginPage.js';
import DashboardPage from './components/DashboardPage.js';
import { User } from './types.js';

export default function App() {
  const { pathname } = usePath();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Automatically reset window scroll position to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Load current session from HTTPOnly Cookie via GET /api/auth/me, supporting localStorage fallback (critical for sandboxed iframes)
  useEffect(() => {
    const localUserStr = localStorage.getItem('prime_agent_user');
    let localUser: User | null = null;
    if (localUserStr) {
      try {
        localUser = JSON.parse(localUserStr);
      } catch (e) {
        console.error('Failed to parse local user:', e);
      }
    }

    const headers: Record<string, string> = {};
    if (localUser) {
      headers['Authorization'] = `Bearer ${localUser.id}`;
      headers['x-session-token'] = localUser.id;
    }

    fetch('/api/auth/me', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('prime_agent_user', JSON.stringify(data.user));
        } else if (localUser) {
          // Fallback to local storage if API server doesn't return but we have local backup
          setCurrentUser(localUser);
        } else {
          setCurrentUser(null);
          localStorage.removeItem('prime_agent_user');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading current user session, using localStorage fallback if available:', err);
        if (localUser) {
          setCurrentUser(localUser);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('prime_agent_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('prime_agent_user');
  };

  // Guard loading indicator
  if (loading) {
    return (
      <div className="bg-[#1A1A1A] text-white min-h-screen flex flex-col items-center justify-center space-y-4 font-sans select-none">
        <div className="flex items-center space-x-2 animate-pulse">
          <span className="text-xl font-extrabold tracking-widest text-[#C9A961] uppercase">PRIME PROPERTY</span>
        </div>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C9A961] border-t-transparent" />
        <span className="text-xs text-zinc-500 font-mono">Menyelaraskan kredensial...</span>
      </div>
    );
  }

  // Determine if we are on a public route or internal route
  const isPublicRoute = pathname === '/' || pathname === '/about' || pathname === '/contact';
  const isLoginRoute = pathname === '/agent/login';
  const isDashboardRoute = pathname === '/dashboard';

  // Fallback to home/landing if route doesn't match anything
  const matchedRoute = isPublicRoute || isLoginRoute || isDashboardRoute;

  // Custom route render dispatcher
  const renderContent = () => {
    if (pathname === '/') {
      return <LandingPage />;
    }
    if (pathname === '/about') {
      return <AboutPage />;
    }
    if (pathname === '/contact') {
      return <ContactPage />;
    }
    if (pathname === '/agent/login') {
      // If already logged in, skip login screen and forward to dashboard!
      if (currentUser) {
        setTimeout(() => navigate('/dashboard'), 50);
        return null;
      }
      return <AgentLoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    if (pathname === '/dashboard') {
      // Security guard: force login access for dashboard
      if (!currentUser) {
        setTimeout(() => navigate('/agent/login'), 50);
        return null;
      }
      return <DashboardPage currentUser={currentUser} onLogout={handleLogout} />;
    }

    // Default Page fallback (Not Found redirects to home)
    setTimeout(() => navigate('/'), 50);
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-brand-gold selection:text-black bg-white text-[#1A1A1A]">
      {/* 1. Header is rendered ONLY on public landing or about/contact views */}
      {isPublicRoute && <Navbar />}

      {/* 2. Primary layout body segment */}
      <div className="flex-1 flex flex-col">
        {renderContent()}
      </div>

      {/* 3. Footer is rendered ONLY on public landing or about/contact views */}
      {isPublicRoute && <Footer />}
    </div>
  );
}
