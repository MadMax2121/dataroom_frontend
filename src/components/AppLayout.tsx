'use client';

import React, { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname();
  
  useEffect(() => {
    // Save current path for redirecting after login
    if (pathname && 
        pathname !== '/login' && 
        pathname !== '/register' && 
        pathname !== '/forgot-password') {
      localStorage.setItem('lastVisitedPage', pathname);
    }
  }, [pathname]);

  // Check if we're on authentication pages
  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/forgot-password';

  // Don't show sidebar on auth pages
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AppLayout; 