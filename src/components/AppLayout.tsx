'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if we're on authentication pages
  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/forgot-password';
    
  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    
    // If user is authenticated and on auth page, redirect to home
    if (token && isAuthPage) {
      router.replace('/');
    }
    
    // If user is not authenticated and not on auth page, redirect to login
    if (!token && !isAuthPage) {
      router.replace('/login');
    }
    
    setIsLoading(false);
  }, [pathname, router, isAuthPage]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

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

  // Show full layout for authenticated users
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }
  
  // Fallback while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Redirecting...</div>
    </div>
  );
};

export default AppLayout; 