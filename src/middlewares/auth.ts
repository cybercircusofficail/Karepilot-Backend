import { Request, Response, NextFunction } from "express";
import { AdminUser, IAdminUser, Permission, AdminRole } from "../models/admin";
import { MobileUser } from "../models/mobile";
import { verifyToken } from "../utils/auth";
import { IMobileUser } from "../types/mobile/mobileUser";

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

export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.userType !== "admin") {
      res.status(401).json({
        success: false,
        message: "Admin authentication required.",
      });
      return;
    }

    const adminUser = req.user as IAdminUser;
    if (!adminUser.hasPermission(permission)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`,
      });
      return;
    }

    next();
  };
};

export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.userType !== "admin") {
      res.status(401).json({
        success: false,
        message: "Admin authentication required.",
      });
      return;
    }

    const adminUser = req.user as IAdminUser;
    if (!adminUser.hasAnyPermission(permissions)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required any of these permissions: ${permissions.join(", ")}`,
      });
      return;
    }

    next();
  };
};
