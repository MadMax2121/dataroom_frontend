'use client';

import { useState, useEffect } from 'react';
import { login } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  
  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.replace('/');
    }
  }, [router]);
  
  useEffect(() => {
    // Save current path if user navigated here from another page
    if (typeof window !== 'undefined' && !redirectTo) {
      const referrer = document.referrer;
      if (referrer && referrer.includes(window.location.host)) {
        // Only save internal redirects, not external ones
        try {
          const url = new URL(referrer);
          const path = url.pathname;
          if (path && path !== '/login' && path !== '/register') {
            localStorage.setItem('lastVisitedPage', path);
          }
        } catch (e) {
          console.error('Error parsing referrer URL:', e);
        }
      }
    }
  }, [redirectTo]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login({ email, password });
      
      // Store the token
      localStorage.setItem('authToken', response.token);
      
      // Redirect to the specified page or last visited page or dashboard
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const lastPage = localStorage.getItem('lastVisitedPage');
        if (lastPage) {
          router.push(lastPage);
        } else {
          router.push('/'); // Go to dashboard
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
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
      
      <form onSubmit={handleSubmit}>
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
