export interface AdminProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

export interface AdminUserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12' | '24';
  autoRefresh: boolean;
  refreshInterval: number; 
}

export interface AdminGeneralSettings extends AdminProfileSettings, AdminUserPreferences {
  userId: string;
}

export interface AdminNotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  securityAlerts: boolean;
  emergencyAlerts: boolean;
  weeklyReports: boolean;
}

export interface AdminSecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  sessionTimeout: number; 
  maxLoginAttempts: number;
  passwordExpiry: number; 
  auditLogs: boolean;
}

export interface AdminPasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

export interface UpdatePreferencesRequest {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12' | '24';
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface UpdateNotificationsRequest {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  securityAlerts: boolean;
  emergencyAlerts: boolean;
  weeklyReports: boolean;
}

export interface UpdateSecurityRequest {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordExpiry: number;
  auditLogs: boolean;
}
