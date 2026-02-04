'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storageService } from '@/services/storage';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Check for existing authentication
  useEffect(() => {
    setMounted(true);
    
    // Small delay to ensure localStorage is ready
    setTimeout(() => {
      const user = storageService.getAuthUser();
      
      if (user) {
        // User is already logged in, redirect to dashboard
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    }, 100);
  }, [router]);

  // Handle PWA install prompt
  useEffect(() => {
    if (!mounted) return;

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [mounted]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  // Don't render landing page content until we've checked authentication
  if (!mounted || isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-24">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                U
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">UPSC Tracker</h1>
              </div>
            </div>
            <div className="flex gap-3">
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-all"
                  title="Install as app"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install
                </button>
              )}
              <Link
                href="/login"
                className="px-5 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </header>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto mb-32">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              75-Day UPSC
              <span className="block text-slate-600">Preparation System</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              Structured syllabus tracking with cloud sync. Stay organized, track progress, and master your preparation.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/register"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all"
              >
                Get Started →
              </Link>
              {showInstallButton && (
                <button 
                  onClick={handleInstallClick}
                  className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download App
                </button>
              )}
            </div>

            <p className="mt-8 text-sm text-slate-400">
              Free • No credit card • Cloud sync
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-100">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Structured Plan</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Complete 75-day syllabus covering Economy, Polity, History, Geography, and all UPSC subjects.
            </p>
          </div>

          {/* Feature 2 */}
          <div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Cloud Sync</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Progress automatically syncs across all your devices. Start anywhere, continue everywhere.
            </p>
          </div>

          {/* Feature 3 */}
          <div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Track Progress</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Monitor completion rates, maintain streaks, and visualize your preparation journey.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Start your preparation today</h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Join students using UPSC Tracker to organize their study schedule.
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 UPSC Tracker. Made for aspirants.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
