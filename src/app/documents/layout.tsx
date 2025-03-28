'use client';

import AuthGuard from '@/components/AuthGuard';

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
} 