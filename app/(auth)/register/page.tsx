'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storageService } from '@/services/storage';

export default function RegisterPage() {
  const router = useRouter();
  const [userIdInput, setUserIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<{
    available: boolean;
    message: string;
  } | null>(null);
  // Check if user is already logged in
  useEffect(() => {
    setTimeout(() => {
      const user = storageService.getAuthUser();
      if (user) {
        // Already logged in, redirect to dashboard
        router.push('/dashboard');
      }
    }, 50);
  }, [router]);

  // Real-time userId availability check
  useEffect(() => {
    const checkAvailability = async () => {
      const cleanId = userIdInput.trim().toLowerCase();
      
      if (cleanId.length < 3) {
        setAvailability(null);
        return;
      }

      setIsChecking(true);
      
      try {
        const response = await fetch(`/api/users/check?userId=${encodeURIComponent(cleanId)}`);
        const data = await response.json();
        setAvailability(data);
      } catch (err) {
        console.error('Failed to check User ID availability:', err);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [userIdInput]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = userIdInput.trim().toLowerCase();

    if (cleanId.length < 3) {
      setError('User ID must be at least 3 characters.');
      return;
    }

    if (availability && !availability.available) {
      setError('This User ID is already taken. Please choose another.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: cleanId,
          name: cleanId.charAt(0).toUpperCase() + cleanId.slice(1),
          email: `${cleanId}@upsc.tracker`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If MongoDB is down but it's just connection issue, create user locally
        if (response.status === 500 && data.error?.includes('server error')) {
          console.warn('⚠️ MongoDB unavailable - using localStorage fallback');
          
          const userData = {
            id: cleanId,
            name: cleanId.charAt(0).toUpperCase() + cleanId.slice(1),
            email: `${cleanId}@upsc.tracker`,
          };

          // Save to localStorage
          storageService.saveAuthUser(userData);
          
          // Create initial progress in localStorage
          const initialProgress = {
            completedTaskIds: [],
            startDate: new Date().toISOString(),
            currentStreak: 0,
            lastStreakUpdate: new Date().toISOString(),
          };
          storageService.saveProgress(cleanId, initialProgress);
          
          // Redirect to dashboard
          router.push('/dashboard');
          return;
        }

        setError(data.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

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
      console.error('❌ Registration failed - using offline mode:', err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to localStorage if network error
      const userData = {
        id: cleanId,
        name: cleanId.charAt(0).toUpperCase() + cleanId.slice(1),
        email: `${cleanId}@upsc.tracker`,
      };

      storageService.saveAuthUser(userData);
      
      const initialProgress = {
        completedTaskIds: [],
        startDate: new Date().toISOString(),
        currentStreak: 0,
        lastStreakUpdate: new Date().toISOString(),
      };
      storageService.saveProgress(cleanId, initialProgress);
      
      router.push('/dashboard');
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
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-600 text-sm">Start your 75-day UPSC journey</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label htmlFor="userId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">
              Choose Your Unique User ID
            </label>
            <div className="relative">
              <input
                id="userId"
                type="text"
                value={userIdInput}
                onChange={(e) => {
                  setUserIdInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. aspirant_2025"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg font-medium shadow-sm"
                disabled={isLoading}
                required
                autoFocus
              />
              {/* Real-time status indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isChecking && userIdInput.length >= 3 && (
                  <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {!isChecking && availability && userIdInput.length >= 3 && (
                  availability.available ? (
                    <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )
                )}
              </div>
            </div>
            
            {/* Availability message */}
            {userIdInput.length >= 3 && availability && (
              <p className={`mt-2 text-xs font-semibold px-1 ${availability.available ? 'text-emerald-600' : 'text-rose-600'}`}>
                {availability.available ? '✓ ' : '✗ '}{availability.message}
              </p>
            )}
            {userIdInput.length > 0 && userIdInput.length < 3 && (
              <p className="mt-2 text-xs text-slate-500 px-1">
                Minimum 3 characters required
              </p>
            )}
          </div>

          {error && <p className="text-rose-700 text-sm font-semibold px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-lg">{error}</p>}

          <button 
            type="submit"
            disabled={isLoading || !userIdInput.trim() || isChecking || (availability !== null && !availability.available)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : 'Create Account & Start'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
              Login here
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase mb-2 tracking-wider">Quick Setup:</h3>
          <ul className="text-sm text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 text-lg leading-none">•</span>
              User ID will be your login identifier
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 text-lg leading-none">•</span>
              Progress automatically syncs across devices
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 text-lg leading-none">•</span>
              Add profile details later in settings
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
