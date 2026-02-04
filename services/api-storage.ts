import { UserProgress, User } from '@/types';

export const apiStorageService = {
  // Register new user (only creates, returns error if exists)
  async registerUser(userId: string, name: string, email: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId.toLowerCase().trim(),
          name,
          email,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${userId}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error in registerUser:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  // Login (get existing user by ID)
  async loginUser(userId: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`/api/users?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'User not found' };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error in loginUser:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  // Get user progress
  async getProgress(userId: string): Promise<UserProgress> {
    try {
      const response = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();

      if (!response.ok) {
        // Return default progress if error
        return {
          completedTaskIds: [],
          startDate: new Date().toISOString(),
          currentStreak: 0,
          lastStreakUpdate: new Date().toISOString(),
        };
      }

      return data.progress;
    } catch (error) {
      console.error('Error in getProgress:', error);
      return {
        completedTaskIds: [],
        startDate: new Date().toISOString(),
        currentStreak: 0,
        lastStreakUpdate: new Date().toISOString(),
      };
    }
  },

  // Save user progress
  async saveProgress(userId: string, progress: UserProgress): Promise<boolean> {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId.toLowerCase().trim(),
          completedTaskIds: progress.completedTaskIds,
          startDate: progress.startDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error saving progress:', data.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveProgress:', error);
      return false;
    }
  },

  // Reset progress
  async resetProgress(userId: string): Promise<UserProgress | null> {
    try {
      const response = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error resetting progress:', data.error);
        return null;
      }

      return data.progress;
    } catch (error) {
      console.error('Error in resetProgress:', error);
      return null;
    }
  },
};
