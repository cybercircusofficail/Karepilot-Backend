import mongoose, { Document, Schema } from "mongoose";

export interface IAdminNotificationSettings extends Document {
  userId: mongoose.Types.ObjectId;
  
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  securityAlerts: boolean;
  emergencyAlerts: boolean;
  weeklyReports: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const adminNotificationSettingsSchema = new Schema<IAdminNotificationSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
      unique: true,
    },
    
    emailNotifications: {
      type: Boolean,
      default: false,
    },
    pushNotifications: {
      type: Boolean,
      default: false,
    },
    smsAlerts: {
      type: Boolean,
      default: true,
    },
    securityAlerts: {
      type: Boolean,
      default: true,
    },
    emergencyAlerts: {
      type: Boolean,
      default: true,
    },
    weeklyReports: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

adminNotificationSettingsSchema.index({ userId: 1 });

const AdminNotificationSettings = mongoose.model<IAdminNotificationSettings>(
  "AdminNotificationSettings", 
  adminNotificationSettingsSchema
);

export default AdminNotificationSettings;
