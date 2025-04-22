'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/pages/Dashboard';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return <div>Redirecting to login...</div>;
  }

  return <Dashboard />;
}