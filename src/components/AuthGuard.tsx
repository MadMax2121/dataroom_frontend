'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const verifyAuth = async () => {
      // Check if token exists
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        // Verify token by fetching current user
        const response = await getCurrentUser();
        
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          // Invalid token
          localStorage.removeItem('authToken');
          router.push('/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('authToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, [router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : null;
} 