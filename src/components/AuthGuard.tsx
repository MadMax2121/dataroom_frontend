'use client';

import { useSession } from "next-auth/react";
import { useRouter }   from "next/navigation";
import { useEffect }   from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router      = useRouter();

  // if we’re definitely not signed in, send to /login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
    }
  }, [status, router]);

  // while NextAuth is loading your session, show a spinner
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-16 w-16 rounded-full border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // once authenticated, render children
  if (status === "authenticated") {
    return <>{children}</>;
  }

  // otherwise (we just triggered a redirect), render nothing
  return null;
}
