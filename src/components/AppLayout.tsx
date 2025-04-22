'use client';

import AuthGuard from '@/components/AuthGuard';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't apply AuthGuard to login and register pages
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
