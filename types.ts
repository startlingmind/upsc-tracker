
export enum TaskStatus {
  TODO = 'todo',
  COMPLETED = 'completed'
}

export enum Phase {
  PHASE_1 = 'Breaking the Weakness Barrier',
  PHASE_2 = 'Core Static & Geography',
  PHASE_3 = 'Dynamic Shift (Env + S&T)',
  PHASE_4 = 'Simulation'
}

export interface Task {
  id: string;
  title: string;
  category: string;
  day: number;
  completed?: boolean; // New field for explicit completion tracking
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UserProgress {
  completedTaskIds: string[];
  startDate: string; // ISO String
  currentStreak: number;
  lastStreakUpdate: string; // ISO String
}

export interface Session {
  userId: string;
  deviceId: string;
  deviceType: 'web' | 'mobile';
  lastActive: string;
  token: string;
}

export interface DailyLog {
  day: number;
  tasks: Task[];
  spillover: Task[];
}
