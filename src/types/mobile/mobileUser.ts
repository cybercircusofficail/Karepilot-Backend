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
  status: MobileUserStatus;
  profileImage?: string;
  lastLogin?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationCode(): string;
  isEmailVerificationCodeValid(code: string): boolean;
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

