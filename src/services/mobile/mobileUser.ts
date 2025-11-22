import { MobileUser } from "../../models/mobile";
import { generateToken } from "../../utils/index";
import { emailService } from "../common";
import { deleteImage, extractPublicIdFromUrl } from "../common/image";
import {
  CreateMobileUserData,
  UpdateMobileUserData,
  MobileUserResult,
  EmailVerificationData,
  VerificationResponse,
  IMobileUser,
  MobileUserStatus,
  UpdateUserSettingsData,
  UserSettings,
  PasswordResetRequestData,
  PasswordResetVerifyData,
  PasswordResetData,
} from "../../types/mobile/mobileUser";

export class MobileUserService {
  async createMobileUser(data: CreateMobileUserData): Promise<MobileUserResult> {
    const existingUser = await MobileUser.findOne({ email: data.email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const mobileUser = new MobileUser({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      status: MobileUserStatus.PENDING,
    });

    const verificationCode = mobileUser.generateEmailVerificationCode();
    await mobileUser.save();

    const emailSent = await emailService.sendEmailVerification(
      {
        fullName: data.fullName,
        verificationCode: verificationCode,
      },
      data.email,
    );

    if (!emailSent) {
      throw new Error("Failed to send verification email. Please try again.");
    }

    return { user: mobileUser };
  }

  async verifyEmail(data: EmailVerificationData): Promise<MobileUserResult> {
    const mobileUser = await MobileUser.findOne({
      emailVerificationCode: data.code,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationCode +emailVerificationExpires");

    if (!mobileUser) {
      throw new Error("Invalid or expired verification code");
    }

    if (mobileUser.isEmailVerified) {
      throw new Error("Email is already verified");
    }

    mobileUser.isEmailVerified = true;
    mobileUser.status = MobileUserStatus.ACTIVE;
    mobileUser.emailVerificationCode = undefined;
    mobileUser.emailVerificationExpires = undefined;
    await mobileUser.save();

    const token = generateToken((mobileUser._id as any).toString());

    return {
      user: mobileUser,
      token,
    };
  }

  async resendVerificationCode(email: string): Promise<VerificationResponse> {
    const mobileUser = await MobileUser.findOne({ email }).select(
      "+emailVerificationCode +emailVerificationExpires",
    );
    if (!mobileUser) {
      throw new Error("User not found");
    }

    if (mobileUser.isEmailVerified) {
      throw new Error("Email is already verified");
    }

    const verificationCode = mobileUser.generateEmailVerificationCode();
    await mobileUser.save();

    const emailSent = await emailService.sendEmailVerification(
      {
        fullName: mobileUser.fullName,
        verificationCode: verificationCode,
      },
      email,
    );

    if (!emailSent) {
      throw new Error("Failed to resend verification email. Please try again.");
    }

    return { email: mobileUser.email };
  }

  async loginMobileUser(email: string, password: string): Promise<MobileUserResult> {
    const mobileUser = await MobileUser.findOne({ email }).select("+password");
    if (!mobileUser) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await mobileUser.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    if (!mobileUser.isEmailVerified) {
      throw new Error("Please verify your email before logging in");
    }

    mobileUser.lastLogin = new Date();
    await mobileUser.save();

    const token = generateToken((mobileUser._id as any).toString());

    return {
      user: mobileUser,
      token,
    };
  }

  async getMobileUserById(id: string): Promise<IMobileUser> {
    const mobileUser = await MobileUser.findById(id).select(
      "-password -emailVerificationCode -emailVerificationExpires",
    );
    if (!mobileUser) {
      throw new Error("Mobile user not found");
    }
    return mobileUser;
  }

  async updateMobileUser(
    id: string,
    data: UpdateMobileUserData,
  ): Promise<IMobileUser> {
    const mobileUser = await MobileUser.findById(id);
    if (!mobileUser) {
      throw new Error("Mobile user not found");
    }

    if (data.profileImage && mobileUser.profileImage) {
      const oldPublicId = extractPublicIdFromUrl(mobileUser.profileImage);
      if (oldPublicId) {
        await deleteImage(oldPublicId);
      }
    }

    const updatedMobileUser = await MobileUser.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return updatedMobileUser!;
  }

  async updateMobileUserPassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const mobileUser = await MobileUser.findById(id).select("+password");
    if (!mobileUser) {
      throw new Error("Mobile user not found");
    }

    const isCurrentPasswordValid = await mobileUser.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    mobileUser.password = newPassword;
    await mobileUser.save();
  }

  async getUserSettings(id: string): Promise<UserSettings> {
    const mobileUser = await MobileUser.findById(id).select("settings");
    if (!mobileUser) {
      throw new Error("Mobile user not found");
    }

    return mobileUser.settings || {
      navigationPreferences: {
        stepFreeRouteOnly: false,
        largeTouchTargets: false,
      },
      languageAndVoice: {
        displayLanguage: "English",
        voiceGuidance: false,
      },
      accessibility: {
        voiceNavigation: false,
        stepRoutesOnly: false,
        largeTextMode: false,
      },
    };
  }

  async updateUserSettings(
    id: string,
    data: UpdateUserSettingsData,
  ): Promise<UserSettings> {
    const mobileUser = await MobileUser.findById(id);
    if (!mobileUser) {
      throw new Error("Mobile user not found");
    }

    if (!mobileUser.settings) {
      mobileUser.settings = {
        navigationPreferences: {
          stepFreeRouteOnly: false,
          largeTouchTargets: false,
        },
        languageAndVoice: {
          displayLanguage: "English",
          voiceGuidance: false,
        },
        accessibility: {
          voiceNavigation: false,
          stepRoutesOnly: false,
          largeTextMode: false,
        },
      };
    }

    if (data.navigationPreferences) {
      mobileUser.settings.navigationPreferences = {
        ...mobileUser.settings.navigationPreferences,
        ...data.navigationPreferences,
      };
    }

    if (data.languageAndVoice) {
      mobileUser.settings.languageAndVoice = {
        ...mobileUser.settings.languageAndVoice,
        ...data.languageAndVoice,
      };
    }

    if (data.accessibility) {
      mobileUser.settings.accessibility = {
        ...mobileUser.settings.accessibility,
        ...data.accessibility,
      };
    }

    await mobileUser.save();

    return mobileUser.settings;
  }

  async requestPasswordReset(data: PasswordResetRequestData): Promise<VerificationResponse> {
    const mobileUser = await MobileUser.findOne({ email: data.email }).select(
      "+passwordResetCode +passwordResetExpires",
    );
    
    if (!mobileUser) {
      throw new Error("If an account exists with this email, a password reset code has been sent");
    }

    if (!mobileUser.isEmailVerified) {
      throw new Error("Please verify your email before resetting password");
    }

    const resetCode = mobileUser.generatePasswordResetCode();
    await mobileUser.save();

    const emailSent = await emailService.sendPasswordReset(
      {
        fullName: mobileUser.fullName,
        resetCode: resetCode,
      },
      data.email,
    );

    if (!emailSent) {
      throw new Error("Failed to send password reset email. Please try again.");
    }

    return { email: mobileUser.email };
  }

  async verifyPasswordResetCode(data: PasswordResetVerifyData): Promise<{ verified: boolean; resetToken: string }> {
    const mobileUser = await MobileUser.findOne({
      passwordResetCode: data.code,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetCode +passwordResetExpires +passwordResetToken +passwordResetTokenExpires");

    if (!mobileUser) {
      throw new Error("Invalid or expired reset code");
    }

    if (!mobileUser.isPasswordResetCodeValid(data.code)) {
      throw new Error("Invalid or expired reset code");
    }

    const resetToken = mobileUser.generatePasswordResetToken();
    mobileUser.passwordResetCode = undefined;
    mobileUser.passwordResetExpires = undefined;
    await mobileUser.save();

    return { verified: true, resetToken };
  }

  async resetPassword(userId: string, data: PasswordResetData): Promise<void> {
    const mobileUser = await MobileUser.findById(userId).select(
      "+password +passwordResetToken +passwordResetTokenExpires",
    );

    if (!mobileUser) {
      throw new Error("User not found");
    }

    if (!mobileUser.passwordResetToken || !mobileUser.passwordResetTokenExpires) {
      throw new Error("No active password reset session");
    }

    if (mobileUser.passwordResetTokenExpires <= new Date()) {
      throw new Error("Reset token has expired");
    }

    mobileUser.password = data.newPassword;
    mobileUser.passwordResetToken = undefined;
    mobileUser.passwordResetTokenExpires = undefined;
    await mobileUser.save();
  }
}

export default new MobileUserService();
