
import { UserProgress, Session, User, Task } from '@/types';
import { UPSC_PLAN } from '@/constants';

const AUTH_USER_KEY = 'upsc_tracker_auth_user';
const SESSION_KEY = 'upsc_tracker_session';
const PROGRESS_PREFIX = 'upsc_progress_';

export const storageService = {
  // Auth & Session
  getAuthUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(AUTH_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveAuthUser: (user: User) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  clearAuth: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): Session | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveSession: (session: Session) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  // User-Specific Progress & Streak Calculation
  getProgress: (userId: string): UserProgress => {
    if (typeof window === 'undefined') {
      return {
        completedTaskIds: [],
        startDate: new Date().toISOString(),
        currentStreak: 0,
        lastStreakUpdate: new Date().toISOString()
      };
    }
    
    const data = localStorage.getItem(`${PROGRESS_PREFIX}${userId}`);
    const progress = data ? JSON.parse(data) : { 
      completedTaskIds: [], 
      startDate: new Date().toISOString(),
      currentStreak: 0,
      lastStreakUpdate: new Date().toISOString()
    };
    
    // Auto-calculate streak on load
    progress.currentStreak = storageService.calculateStreak(progress.completedTaskIds, progress.startDate);
    return progress;
  },

  calculateStreak: (completedTaskIds: string[], startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const activeDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let streak = 0;
    // Count backwards from yesterday (don't break streak for unfinished 'today' yet)
    for (let d = activeDay - 1; d >= 1; d--) {
      const dayTasks = UPSC_PLAN.filter(t => t.day === d);
      if (dayTasks.length === 0) continue; // Skip empty days
      
      const allDone = dayTasks.every(t => completedTaskIds.includes(t.id));
      if (allDone) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
    
    // Check if today is also fully completed to add to streak
    const todayTasks = UPSC_PLAN.filter(t => t.day === activeDay);
    if (todayTasks.length > 0 && todayTasks.every(t => completedTaskIds.includes(t.id))) {
      streak++;
    }

    return streak;
  },

  saveProgress: (userId: string, progress: UserProgress) => {
    if (typeof window === 'undefined') return;
    // Recalculate streak before saving
    progress.currentStreak = storageService.calculateStreak(progress.completedTaskIds, progress.startDate);
    progress.lastStreakUpdate = new Date().toISOString();
    localStorage.setItem(`${PROGRESS_PREFIX}${userId}`, JSON.stringify(progress));
  },

  clearAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
};
