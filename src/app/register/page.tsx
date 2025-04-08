'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Log the request data for debugging
      console.log('Sending registration data:', formData);
      
      // Modified to include detailed error logging
      const response = await register(formData);
      console.log('Registration successful:', response);
      
      // Redirect to login page after successful registration
      router.push('/login?registered=true');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // More detailed error handling
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          // Format field-specific errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          setError(`Validation error: ${errorMessages}`);
        } else {
          setError(errorData.message || 'Registration failed');
        }
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="min-w-96 max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="username">
              Username*
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email*
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="password">
              Password*
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="first_name">
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-1" htmlFor="last_name">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-6 rounded text-white ${
              loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a></p>
        </div>
      </div>
    </div>
  );
} 