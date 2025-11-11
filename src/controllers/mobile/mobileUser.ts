import { Request, Response } from "express";
import { mobileUserService } from "../../services/mobile";

export const registerMobileUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await mobileUserService.createMobileUser(req.body);

    res.status(201).json({
      success: true,
      message: "Mobile user registered successfully. Please verify your email.",
      data: {
        user: {
          id: result.user._id,
          fullName: result.user.fullName,
          email: result.user.email,
          isEmailVerified: result.user.isEmailVerified,
          status: result.user.status,
          createdAt: result.user.createdAt,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error registering mobile user",
    });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { code } = req.body;

    const result = await mobileUserService.verifyEmail({ code });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          id: result.user._id,
          fullName: result.user.fullName,
          email: result.user.email,
          isEmailVerified: result.user.isEmailVerified,
          status: result.user.status,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
        token: result.token,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error verifying email",
    });
  }
};

export const resendVerificationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const result = await mobileUserService.resendVerificationCode(email);

    res.status(200).json({
      success: true,
      message: "Verification code resent successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error resending verification code",
    });
  }
};

export const loginMobileUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await mobileUserService.loginMobileUser(email, password);

    res.status(200).json({
      success: true,
      message: "Mobile user logged in successfully",
      data: {
        user: {
          id: result.user._id,
          fullName: result.user.fullName,
          email: result.user.email,
          isEmailVerified: result.user.isEmailVerified,
          status: result.user.status,
          lastLogin: result.user.lastLogin,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
        token: result.token,
      },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};

export const getMobileProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const mobileUser = await mobileUserService.getMobileUserById(userId);

    res.status(200).json({
      success: true,
      message: "Mobile user profile retrieved successfully",
      data: {
        user: {
          id: mobileUser._id,
          fullName: mobileUser.fullName,
          email: mobileUser.email,
          isEmailVerified: mobileUser.isEmailVerified,
          profileImage: mobileUser.profileImage,
          lastLogin: mobileUser.lastLogin,
          createdAt: mobileUser.createdAt,
          updatedAt: mobileUser.updatedAt,
        },
      },
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Mobile user not found",
    });
  }
};

export const updateMobileProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const updateData = req.body;

    const mobileUser = await mobileUserService.updateMobileUser(userId, updateData);

    res.status(200).json({
      success: true,
      message: "Mobile user profile updated successfully",
      data: {
        user: {
          id: mobileUser._id,
          fullName: mobileUser.fullName,
          email: mobileUser.email,
          isEmailVerified: mobileUser.isEmailVerified,
          profileImage: mobileUser.profileImage,
          status: mobileUser.status,
          lastLogin: mobileUser.lastLogin,
          createdAt: mobileUser.createdAt,
          updatedAt: mobileUser.updatedAt,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating mobile user profile",
    });
  }
};

export const changeMobilePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    await mobileUserService.updateMobileUserPassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error changing password",
    });
  }
};

