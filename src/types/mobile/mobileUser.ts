import { Document } from "mongoose";

export enum MobileUserStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  PENDING = "Pending",
  SUSPENDED = "Suspended",
}

export interface IMobileUser extends Document {
  fullName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationCode?: string | undefined;
  emailVerificationExpires?: Date | undefined;
  passwordResetCode?: string | undefined;
  passwordResetExpires?: Date | undefined;
  passwordResetToken?: string | undefined;
  passwordResetTokenExpires?: Date | undefined;
  status: MobileUserStatus;
  profileImage?: string;
  lastLogin?: Date | undefined;
  settings?: UserSettings;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationCode(): string;
  isEmailVerificationCodeValid(code: string): boolean;
  generatePasswordResetCode(): string;
  isPasswordResetCodeValid(code: string): boolean;
  generatePasswordResetToken(): string;
  isPasswordResetTokenValid(token: string): boolean;
}

export interface CreateMobileUserData {
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateMobileUserData {
  fullName?: string;
  email?: string;
  profileImage?: string;
}

export interface MobileUserResult {
  user: IMobileUser;
  token?: string;
}

export interface EmailVerificationData {
  code: string;
}

export interface MobileUserResponse {
  id: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  status: MobileUserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationResponse {
  email: string;
}

export interface NavigationPreferences {
  stepFreeRouteOnly: boolean;
  largeTouchTargets: boolean;
}

export interface LanguageAndVoice {
  displayLanguage: string;
  voiceGuidance: boolean;
}

export interface AccessibilitySettings {
  voiceNavigation: boolean;
  stepRoutesOnly: boolean;
  largeTextMode: boolean;
}

export interface UserSettings {
  navigationPreferences: NavigationPreferences;
  languageAndVoice: LanguageAndVoice;
  accessibility: AccessibilitySettings;
}

export interface UpdateUserSettingsData {
  navigationPreferences?: Partial<NavigationPreferences>;
  languageAndVoice?: Partial<LanguageAndVoice>;
  accessibility?: Partial<AccessibilitySettings>;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetVerifyData {
  code: string;
}

export interface PasswordResetData {
  newPassword: string;
}

