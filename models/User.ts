import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  userId: string;
  name?: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // This already creates an index
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: false, // Optional - can be added in profile settings
    },
    email: {
      type: String,
      required: false, // Optional - can be added in profile settings
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Note: Index is automatically created by unique: true above
// No need for manual index creation

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
