'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'loading') {
      // Session is being fetched
      return;
    }
    
    if (status === 'unauthenticated') {
      // No active session, redirect to login
      router.push('/login');
    }
  }, [status, router]);
  
  // Show loading state while checking session
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  // Only render children if authenticated
  return session ? <>{children}</> : null;
} 