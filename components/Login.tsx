'use client';

import React, { useState } from 'react';
import { User } from '@/types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface LoginProps {
  onLogin: (user: User) => void;
  deferredPrompt?: BeforeInstallPromptEvent;
  onInstall?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, deferredPrompt, onInstall }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [userIdInput, setUserIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = userIdInput.trim().toLowerCase();

    if (cleanId.length < 3) {
      setError('User ID must be at least 3 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if user already exists
      const checkResponse = await fetch(`/api/users?userId=${encodeURIComponent(cleanId)}`);
      
      if (checkResponse.ok) {
        setError('User ID already exists. Please login or choose a different ID.');
        setIsLoading(false);
        return;
      }

      // Create new user with just userId
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: cleanId,
          name: cleanId.charAt(0).toUpperCase() + cleanId.slice(1), // Default name from userId
          email: `${cleanId}@upsc.tracker`, // Default email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Successfully registered, now login
      onLogin(data.user);
    } catch {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = userIdInput.trim().toLowerCase();

    if (cleanId.length < 3) {
      setError('User ID must be at least 3 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if user exists
      const response = await fetch(`/api/users?userId=${encodeURIComponent(cleanId)}`);
      
      if (!response.ok) {
        setError('User not found. Please register first.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      onLogin(data.user);
    } catch {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setUserIdInput('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full glass bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-xl shadow-indigo-500/20">U</div>
          <h1 className="text-2xl font-extrabold text-white mb-2">UPSC Tracker Pro</h1>
          <p className="text-slate-400 text-sm">Join the 75-Day Challenge</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => mode !== 'register' && switchMode()}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => mode !== 'login' && switchMode()}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
        </div>

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="userId" className="block text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mb-2 px-1">
                Create Your Unique User ID
              </label>
              <input
                id="userId"
                type="text"
                value={userIdInput}
                onChange={(e) => {
                  setUserIdInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. aspirant_2025"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg font-medium"
                disabled={isLoading}
                required
                autoFocus
              />
              <p className="mt-2 text-xs text-slate-400 px-1">
                Minimum 3 characters. This will be your login ID.
              </p>
            </div>

            {error && <p className="text-rose-400 text-xs font-medium px-1 py-2 bg-rose-500/10 rounded-lg">{error}</p>}

            <button 
              type="submit"
              disabled={isLoading || !userIdInput.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : 'Start Your Journey'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="loginUserId" className="block text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mb-2 px-1">
                Enter Your User ID
              </label>
              <input
                id="loginUserId"
                type="text"
                value={userIdInput}
                onChange={(e) => {
                  setUserIdInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Your user ID"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg font-medium"
                disabled={isLoading}
                required
                autoFocus
              />
            </div>

            {error && <p className="text-rose-400 text-xs font-medium px-1 py-2 bg-rose-500/10 rounded-lg">{error}</p>}

            <button 
              type="submit"
              disabled={isLoading || !userIdInput.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : 'Continue to Dashboard'}
            </button>
          </form>
        )}

        {deferredPrompt && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <button 
              onClick={onInstall}
              className="w-full group bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold py-3 rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <div className="p-1.5 bg-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </div>
              <span className="text-sm tracking-wide">Download UPSC Pro App</span>
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
          <h3 className="text-[10px] font-bold text-indigo-300 uppercase mb-2 tracking-widest">
            {mode === 'register' ? 'Quick Setup:' : 'Welcome Back:'}
          </h3>
          <ul className="text-[11px] text-slate-400 space-y-2">
            {mode === 'register' ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 text-lg leading-none">•</span>
                  Only User ID needed to get started
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 text-lg leading-none">•</span>
                  Add name & email later in profile settings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 text-lg leading-none">•</span>
                  Your progress syncs automatically across devices
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 text-lg leading-none">•</span>
                  Enter your User ID to continue
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 text-lg leading-none">•</span>
                  Your progress loads from the cloud
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 text-lg leading-none">•</span>
                  New here? Switch to Register tab
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
