import mongoose, { Document, Schema } from "mongoose";

export interface IAdminSecuritySettings extends Document {
  userId: mongoose.Types.ObjectId;
  
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordExpiry: number;
  auditLogs: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const adminSecuritySettingsSchema = new Schema<IAdminSecuritySettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
      unique: true,
    },
    
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    sessionTimeout: {
      type: Number,
      default: 30, 
      min: [5, "Session timeout must be at least 5 minutes"],
      max: [480, "Session timeout cannot exceed 8 hours"],
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: [3, "Max login attempts must be at least 3"],
      max: [10, "Max login attempts cannot exceed 10"],
    },
    passwordExpiry: {
      type: Number,
      default: 90, 
      min: [30, "Password expiry must be at least 30 days"],
      max: [365, "Password expiry cannot exceed 365 days"],
    },
    auditLogs: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

adminSecuritySettingsSchema.index({ userId: 1 });

const AdminSecuritySettings = mongoose.model<IAdminSecuritySettings>(
  "AdminSecuritySettings", 
  adminSecuritySettingsSchema
);

export default AdminSecuritySettings;
