import mongoose, { Schema, Model } from 'mongoose';

export interface IProgress {
  userId: string;
  completedTaskIds: string[];
  startDate: string;
  currentStreak: number;
  lastStreakUpdate: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // This already creates an index
      ref: 'User',
    },
    completedTaskIds: {
      type: [String],
      default: [],
    },
    startDate: {
      type: String,
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastStreakUpdate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: Index is automatically created by unique: true above
// No need for manual index creation

const Progress: Model<IProgress> = mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);

export default Progress;
