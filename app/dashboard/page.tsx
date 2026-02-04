'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UPSC_PLAN, getPhaseForDay } from '@/constants';
import { Task, UserProgress, Session, Phase, User } from '@/types';
import { storageService } from '@/services/storage';
import { apiStorageService } from '@/services/api-storage';
import { notificationService } from '@/services/notification';
import DayTracker from '@/components/DayTracker';
import Stats from '@/components/Stats';
import AIExpert from '@/components/AIExpert';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentViewDay, setCurrentViewDay] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionConflict, setSessionConflict] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    
    // Small delay to ensure localStorage is ready
    setTimeout(() => {
      const user = storageService.getAuthUser();
      
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }
      
      setCurrentUser(user);
      setSession(storageService.getSession());
    }, 50);
  }, [router]);

  // Handle PWA install prompt
  useEffect(() => {
    if (!mounted) return;
    
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [mounted]);

  // Initialize session and load user progress when user changes
  useEffect(() => {
    if (!mounted) return;

    const loadUserData = async () => {
      if (currentUser) {
        // Try to load from MongoDB first
        const userProgress = await apiStorageService.getProgress(currentUser.id);
        setProgress(userProgress);

        if (!session || session.userId !== currentUser.id) {
          const newSession: Session = {
            userId: currentUser.id,
            deviceId: Math.random().toString(36).substring(7),
            deviceType: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'web',
            lastActive: new Date().toISOString(),
            token: btoa(Math.random().toString())
          };
          storageService.saveSession(newSession);
          setSession(newSession);
        }
      } else {
        setProgress(null);
        setSession(null);
      }
    };

    loadUserData();
  }, [currentUser, mounted]);

  // Session Heartbeat
  useEffect(() => {
    if (!mounted || !currentUser || !session) return;

    const interval = setInterval(() => {
      const currentSession = storageService.getSession();
      if (currentSession && currentSession.deviceId !== session.deviceId) {
        setSessionConflict(true);
        setTimeout(() => handleLogout(), 3000);
      } else {
        const updated = { ...session, lastActive: new Date().toISOString() };
        storageService.saveSession(updated);
        setSession(updated);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentUser, session, mounted]);

  const activeDay = useMemo(() => {
    if (!progress) return 1;
    const start = new Date(progress.startDate);
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diffDays, 1), 75);
  }, [progress?.startDate]);

  useEffect(() => {
    if (activeDay) setCurrentViewDay(activeDay);
  }, [activeDay]);

  const handleLogout = () => {
    storageService.clearAuth();
    setCurrentUser(null);
    setSessionConflict(false);
    router.push('/login');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const toggleTask = async (taskId: string) => {
    if (!currentUser || !progress) return;
    const newCompleted = progress.completedTaskIds.includes(taskId)
      ? progress.completedTaskIds.filter(id => id !== taskId)
      : [...progress.completedTaskIds, taskId];
    const newProgress = { ...progress, completedTaskIds: newCompleted };
    setProgress(newProgress);
    
    // Save to MongoDB
    const saved = await apiStorageService.saveProgress(currentUser.id, newProgress);
    
    // Fallback to localStorage if API fails
    if (!saved) {
      storageService.saveProgress(currentUser.id, newProgress);
    }
  };

  const resetProgress = async () => {
    if (!currentUser) return;
    if (confirm("Reset all progress for this user? This cannot be undone.")) {
      // Reset in MongoDB
      const resetData = await apiStorageService.resetProgress(currentUser.id);
      
      if (resetData) {
        setProgress(resetData);
      } else {
        // Fallback to localStorage
        const reset = { 
          completedTaskIds: [], 
          startDate: new Date().toISOString(),
          currentStreak: 0,
          lastStreakUpdate: new Date().toISOString()
        };
        setProgress(reset);
        storageService.saveProgress(currentUser.id, reset);
      }
      setCurrentViewDay(1);
    }
  };

  const getCalendarDate = (day: number) => {
    if (!progress) return '';
    const d = new Date(progress.startDate);
    d.setDate(d.getDate() + (day - 1));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  // Show loading if no user yet
  if (!currentUser || !progress) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (sessionConflict) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Session Conflict</h2>
          <p className="text-slate-400 text-sm">Another device has claimed this User ID. Logging you out for security.</p>
          <div className="pt-4 animate-pulse text-indigo-400 text-sm font-medium">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <header className="md:hidden glass sticky top-0 z-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
          <div>
            <h1 className="font-bold text-slate-800 tracking-tight leading-none text-sm">Day {activeDay}</h1>
            <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{currentUser.name || currentUser.id}</p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </header>

      {/* Overlay/Backdrop - closes drawer when clicked */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-80 glass border-r border-slate-200 transition-transform duration-300 ease-in-out flex flex-col shadow-xl`}>
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="hidden md:flex flex-col mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">U</div>
              <div>
                <h1 className="font-bold text-slate-800 leading-tight">UPSC Pro</h1>
                <p className="text-xs text-slate-400 font-medium">Progressive Tracker</p>
              </div>
            </div>
            <div className="mt-3 px-1">
              <p className="text-sm font-black text-indigo-600">
                {currentUser.name || currentUser.id}
              </p>
            </div>
          </div>

          <nav className="space-y-6">
            {/* Day Navigator - Show 3 Days */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day Navigator</h3>
                <span className="text-[10px] text-slate-500 font-medium">{getPhaseForDay(currentViewDay)}</span>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentViewDay(Math.max(1, currentViewDay - 1))}
                  disabled={currentViewDay === 1}
                  className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous day"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-500">Viewing</p>
                  <p className="text-lg font-black text-indigo-600">Day {currentViewDay}</p>
                </div>

                <button
                  onClick={() => setCurrentViewDay(Math.min(75, currentViewDay + 1))}
                  disabled={currentViewDay === 75}
                  className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Next day"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* 3-Day View */}
              <div className="space-y-3">
                {[currentViewDay - 1, currentViewDay, currentViewDay + 1].map((day) => {
                  if (day < 1 || day > 75) return null;
                  
                  const isCompleted = UPSC_PLAN.filter(t => t.day === day).every(t => progress.completedTaskIds.includes(t.id));
                  const isActive = currentViewDay === day;
                  const isToday = activeDay === day;
                  const dayDate = getCalendarDate(day);
                  
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setCurrentViewDay(day);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`w-full p-4 rounded-xl transition-all border-2 ${
                        isActive 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-[1.02]' 
                          : isCompleted 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400' 
                          : isToday 
                          ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold hover:border-amber-400' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-black">Day {day}</span>
                            {isToday && (
                              <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                                isActive ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
                              }`}>
                                Today
                              </span>
                            )}
                          </div>
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-indigo-100' : 'text-slate-500'
                          }`}>
                            {dayDate}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <div className={`p-1 rounded-lg ${
                              isActive ? 'bg-white/20' : 'bg-emerald-200'
                            }`}>
                              <svg className={`w-5 h-5 ${
                                isActive ? 'text-white' : 'text-emerald-700'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          {isActive && (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Jump */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentViewDay(activeDay)}
                    className="flex-1 py-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    Jump to Today
                  </button>
                  <button
                    onClick={() => setCurrentViewDay(1)}
                    className="flex-1 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    Day 1
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100">
              <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3">Progress Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Completed</span>
                  <span className="text-indigo-700 font-bold">
                    {progress.completedTaskIds.length} / {UPSC_PLAN.length} tasks
                  </span>
                </div>
                <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((progress.completedTaskIds.length / UPSC_PLAN.length) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="p-5 border-t border-slate-200 bg-slate-50/80">
          {deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="w-full mb-4 py-3 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Install UPSC Pro
            </button>
          )}
          <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.id}`} className="w-8 h-8 opacity-80" alt="Profile" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID ACTIVE</p>
              <p className="text-sm font-black text-indigo-700 truncate">@{currentUser.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetProgress} className="flex-1 py-2 text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all border border-transparent">Reset</button>
            <button onClick={handleLogout} className="flex-1 py-2 text-[10px] font-bold text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent">Logout</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
            <Stats progress={progress} activeDay={activeDay} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              <div className="lg:col-span-8 space-y-4 md:space-y-6">
                <DayTracker viewDay={currentViewDay} activeDay={activeDay} progress={progress} onToggleTask={toggleTask} />
              </div>
              <div className="lg:col-span-4 space-y-4 md:space-y-6">
                <AIExpert day={currentViewDay} tasks={UPSC_PLAN.filter(t => t.day === currentViewDay)} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
