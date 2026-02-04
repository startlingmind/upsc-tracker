
export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  async scheduleReminder(time: string, userName: string) {
    if (typeof window === 'undefined' || Notification.permission !== 'granted') return;

    // Test notification immediately to confirm setup
    new Notification('UPSC Tracker Reminder Set!', {
      body: `Hey ${userName}, we'll remind you daily at ${time} to crush your goals.`,
      icon: 'https://api.dicebear.com/7.x/initials/svg?seed=U&backgroundColor=4f46e5'
    });
  },

  checkPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    return Notification.permission;
  }
};
