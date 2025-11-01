import mongoose, { Document, Schema } from "mongoose";

export interface IAdminGeneralSettings extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12' | '24';
  autoRefresh: boolean;
  refreshInterval: number; 
  createdAt: Date;
  updatedAt: Date;
}

const adminGeneralSettingsSchema = new Schema<IAdminGeneralSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    profileImage: {
      type: String,
      trim: true,
    },
    
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
      trim: true,
    },
    dateFormat: {
      type: String,
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY',
    },
    timeFormat: {
      type: String,
      enum: ['12', '24'],
      default: '24',
    },
    autoRefresh: {
      type: Boolean,
      default: true,
    },
    refreshInterval: {
      type: Number,
      default: 30,
      min: [5, "Refresh interval must be at least 5 seconds"],
      max: [300, "Refresh interval cannot exceed 300 seconds"],
    },
  },
  {
    timestamps: true,
  }
);

adminGeneralSettingsSchema.index({ userId: 1 });

const AdminGeneralSettings = mongoose.model<IAdminGeneralSettings>(
  "AdminGeneralSettings", 
  adminGeneralSettingsSchema
);

export default AdminGeneralSettings;
