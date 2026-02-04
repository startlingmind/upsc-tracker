'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storageService } from '@/services/storage';

export default function LoginPage() {
  const router = useRouter();
  const [userIdInput, setUserIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    setMounted(true);
    
    setTimeout(() => {
      const user = storageService.getAuthUser();
      if (user) {
        // Already logged in, redirect to dashboard
        router.push('/dashboard');
      }
    }, 50);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = userIdInput.trim().toLowerCase();

    if (cleanId.length < 3) {
      setError('User ID must be at least 3 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    setShowRegisterPrompt(false);

    try {
      const response = await fetch(`/api/users?userId=${encodeURIComponent(cleanId)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setShowRegisterPrompt(true);
          setError('User not found. Please register first.');
        } else {
          setError('Login failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Ensure user object has required fields
      const userData = {
        id: data.user.id,
        name: data.user.name || data.user.id,
        email: data.user.email || `${data.user.id}@upsc.tracker`,
        avatar: data.user.avatar,
      };

      // Save user to localStorage for authentication
      storageService.saveAuthUser(userData);
      
      // Small delay to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Login failed:', err instanceof Error ? err.message : 'Network error');
      setError('Network error. Please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl relative z-10 animate-slide-up border border-slate-200">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-xl shadow-indigo-500/20">
              U
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600 text-sm">Continue your UPSC preparation journey</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="userId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">
              Enter Your User ID
            </label>
            <input
              id="userId"
              type="text"
              value={userIdInput}
              onChange={(e) => {
                setUserIdInput(e.target.value);
                if (error) setError('');
                if (showRegisterPrompt) setShowRegisterPrompt(false);
              }}
              placeholder="Your user ID"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg font-medium shadow-sm"
              disabled={isLoading}
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-rose-700 text-sm font-semibold px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Register Prompt - Flashing/Highlighted */}
          {showRegisterPrompt && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 shadow-xl border-2 border-indigo-400 animate-pulse">
              <p className="text-white text-base font-bold mb-3 text-center">
                🎯 Don't have an account? Create one now!
              </p>
              <Link
                href="/register"
                className="block w-full bg-white text-indigo-600 font-bold py-3.5 rounded-lg text-center hover:bg-indigo-50 transition-all shadow-lg text-base"
              >
                Register Now →
              </Link>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading || !userIdInput.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : 'Continue to Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            New to UPSC Tracker?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
              Create account
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">Welcome Back:</h3>
          <ul className="text-sm text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 text-lg leading-none">•</span>
              Your progress loads from the cloud
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 text-lg leading-none">•</span>
              Pick up right where you left off
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 text-lg leading-none">•</span>
              Access from any device, anytime
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
