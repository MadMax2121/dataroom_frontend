'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  
  // Get the callback URL or default to homepage
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  // If already authenticated, redirect to callback URL
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    } else if (status !== 'loading') {
      // Mark initial check as done when we know the user is not authenticated
      setInitialAuthCheckDone(true);
    }
  }, [status, callbackUrl, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setError('');
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });
      
      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else if (result?.ok) {
        // Successful login, redirect will be handled by the useEffect
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn('google', {
      callbackUrl
    });
  };

  // Show loading during initial authentication check only
  if (status === 'loading' && !initialAuthCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 mx-auto rounded-full border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p>Checking authentication status...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Only show login form if explicitly not authenticated or initial check is done
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">DataVault</h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {searchParams?.get('error') && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          Invalid email or password
        </div>
      )}
      
      <form onSubmit={handleSignIn}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#4285F4"
                d="M21.35 11.1h-9.17v2.17h6.19c-.41 2.19-2.44 4.04-5.19 4.04-3.1 0-5.61-2.46-5.61-5.5s2.52-5.5 5.61-5.5c1.48 0 2.81.6 3.91 1.55l1.55-1.5C17.35 5.04 15.38 4 13.19 4c-4.95 0-9 4.05-9 9s4.05 9 9 9c4.12 0 7.83-3.06 8.12-7.39.04-.29.07-.58.07-.89 0-.34-.03-.67-.07-1h-8.12z"
              ></path>
            </svg>
            <span className="text-gray-700">Sign in with Google</span>
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-800">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
