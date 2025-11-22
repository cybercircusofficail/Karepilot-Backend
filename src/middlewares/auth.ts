import { Request, Response, NextFunction } from "express";
import { AdminUser, IAdminUser, AdminRole } from "../models/admin/user-management";
import { MobileUser } from "../models/mobile";
import { verifyToken } from "../utils/auth";
import { IMobileUser } from "../types/mobile/mobileUser";
import { IPermission } from "../models/admin/user-management/roles-permissions";

declare global {
  namespace Express {
    interface Request {
      user?: IAdminUser | IMobileUser;
      userType?: "admin" | "mobile";
    }
  }
}

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      token = req.cookies?.["auth-token"] || null;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    const decoded = verifyToken(token);
    const user = await AdminUser.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Invalid token or admin user not found.",
      });
      return;
    }

    req.user = user;
    req.userType = "admin";
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export const authenticateMobile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      token = req.cookies?.["auth-token"] || null;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    const decoded = verifyToken(token);
    const user = await MobileUser.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid token or mobile user not found.",
      });
      return;
    }

    req.user = user;
    req.userType = "mobile";
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export const requirePermission = (permission: keyof IPermission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.userType !== "admin") {
      res.status(401).json({
        success: false,
        message: "Admin authentication required.",
      });
      return;
    }

    next();
  };
};

export const requireAnyPermission = (permissions: (keyof IPermission)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.userType !== "admin") {
      res.status(401).json({
        success: false,
        message: "Admin authentication required.",
      });
      return;
    }

    next();
  };
};

export const authenticatePasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let resetToken = req.header("Authorization")?.replace("Bearer ", "");

    if (!resetToken) {
      resetToken = req.cookies?.["reset-token"] || null;
    }

    if (!resetToken) {
      res.status(401).json({
        success: false,
        message: "Access denied. No reset token provided.",
      });
      return;
    }

    const mobileUser = await MobileUser.findOne({
      passwordResetToken: resetToken,
      passwordResetTokenExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetTokenExpires");

    if (!mobileUser) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
      return;
    }

    if (!mobileUser.isPasswordResetTokenValid(resetToken)) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
      return;
    }

    req.user = mobileUser;
    req.userType = "mobile";
    (req as any).resetToken = resetToken;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid reset token.",
    });
  }
};