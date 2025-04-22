// Session management utilities
import { getSession, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

/**
 * Gets the authentication token from the NextAuth session
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await getSession();
    return session?.apiToken || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Gets the current user ID from the NextAuth session
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * Checks if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Handles authentication errors
 */
export function handleAuthError(error: any): void {
  // If unauthorized or forbidden, handle logout
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    // Don't redirect on API calls that don't need auth
    const isPublicEndpoint = 
      error.config?.url?.includes('/users/login') || 
      error.config?.url?.includes('/users/register') ||
      error.config?.url?.includes('/users/oauth');
      
    if (!isPublicEndpoint) {
      console.warn('Authentication error, redirecting to login');
      // Use setTimeout to avoid calling signOut during render
      setTimeout(() => {
        signOut({ redirect: true, callbackUrl: '/login' });
      }, 0);
    }
  }
}

export type AuthSession = Session & {
  apiToken?: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
} 