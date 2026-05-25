import { useEffect, useState } from 'react';

// Custom router helper for real-time SPA navigation
export function navigate(path: string, searchParams?: Record<string, string>) {
  let url = path;
  if (searchParams) {
    const query = new URLSearchParams(searchParams).toString();
    if (query) {
      url += '?' + query;
    }
  }
  
  window.history.pushState({}, '', url);
  // Tell our router hook that location changed
  const event = new CustomEvent('app-navigation', { detail: { path, searchParams } });
  window.dispatchEvent(event);
}

export function usePath() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('app-navigation', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('app-navigation', handleLocationChange);
    };
  }, []);

  return { pathname, searchParams };
}
