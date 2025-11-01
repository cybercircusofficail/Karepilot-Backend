import { AdminUser } from '../../../models/admin';
import { AdminGeneralSettings } from '../../../models/admin/settings';
import { AdminNotificationSettings } from '../../../models/admin/settings';
import { AdminSecuritySettings } from '../../../models/admin/settings';
import { 
  AdminPasswordChange,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  UpdateNotificationsRequest,
  UpdateSecurityRequest
} from '../../../types/admin/settings/admin';

export class AdminSettingsService {
  
  static async getGeneralSettings(userId: string) {
    let settings = await AdminGeneralSettings.findOne({ userId });
    
    if (!settings) {
      const adminUser = await AdminUser.findById(userId);
      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      const nameParts = adminUser.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      settings = new AdminGeneralSettings({
        userId,
        firstName,
        lastName,
        email: adminUser.email,
        profileImage: adminUser.profileImage,
        theme: 'system',
        language: 'English',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24',
        autoRefresh: true,
        refreshInterval: 30
      });

      await settings.save();
    }

    return settings;
  }

  static async updateProfile(userId: string, profileData: UpdateProfileRequest) {
    if (profileData.email) {
      const existingUser = await AdminUser.findOne({ 
        email: profileData.email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        throw new Error('Email is already taken by another user');
      }
    }

    const settings = await AdminGeneralSettings.findOneAndUpdate(
      { userId },
      {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email?.toLowerCase(),
        profileImage: profileData.profileImage
      },
      { new: true, upsert: true, runValidators: true }
    );

    await AdminUser.findByIdAndUpdate(
      userId,
      {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email?.toLowerCase(),
        profileImage: profileData.profileImage
      },
      { runValidators: true }
    );

    return settings;
  }

  static async updatePreferences(userId: string, preferencesData: UpdatePreferencesRequest) {
    const settings = await AdminGeneralSettings.findOneAndUpdate(
      { userId },
      preferencesData,
      { new: true, upsert: true, runValidators: true }
    );

    return settings;
  }

  static async getNotificationSettings(userId: string) {
    let settings = await AdminNotificationSettings.findOne({ userId });
    
    if (!settings) {
      settings = new AdminNotificationSettings({
        userId,
        emailNotifications: false,
        pushNotifications: false,
        smsAlerts: true,
        securityAlerts: true,
        emergencyAlerts: true,
        weeklyReports: true
      });

      await settings.save();
    }

    return settings;
  }

  static async updateNotifications(userId: string, notificationData: UpdateNotificationsRequest) {
    const settings = await AdminNotificationSettings.findOneAndUpdate(
      { userId },
      notificationData,
      { new: true, upsert: true, runValidators: true }
    );

    return settings;
  }

  static async getSecuritySettings(userId: string) {
    let settings = await AdminSecuritySettings.findOne({ userId });
    
    if (!settings) {
      settings = new AdminSecuritySettings({
        userId,
        twoFactorEnabled: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordExpiry: 90,
        auditLogs: true
      });

      await settings.save();
    }

    return settings;
  }

  static async updateSecuritySettings(userId: string, securityData: UpdateSecurityRequest) {
    const settings = await AdminSecuritySettings.findOneAndUpdate(
      { userId },
      securityData,
      { new: true, upsert: true, runValidators: true }
    );

    return settings;
  }

  static async changePassword(userId: string, passwordData: AdminPasswordChange) {
    const user = await AdminUser.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await user.comparePassword(passwordData.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = passwordData.newPassword;
    await user.save();

    return { success: true };
  }
}
