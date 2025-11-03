import { Request, Response } from "express";
import { usersService } from "../../../services/admin/user-management";
import { formatTimeAgo } from "../../../utils";
import { UserStatus } from "../../../models/admin/user-management";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.page) query.page = parseInt(req.query.page as string);
    if (req.query.limit) query.limit = parseInt(req.query.limit as string);
    if (req.query.role) query.role = req.query.role;
    if (req.query.department) query.department = req.query.department as string;
    if (req.query.search) query.search = req.query.search as string;
    if (req.query.status) query.status = req.query.status as string;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const result = await usersService.getAllUsers(query);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: result.users.map((user) => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          badgeNumber: user.badgeNumber,
          shift: user.shift,
          profileImage: user.profileImage,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          lastActive: user.lastLogin ? formatTimeAgo(user.lastLogin) : "Never",
          currentLocation: user.currentLocation || null,
          status: user.status || UserStatus.PENDING,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving users",
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await usersService.getUserById(id as string);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          badgeNumber: user.badgeNumber,
          shift: user.shift,
          profileImage: user.profileImage,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          lastActive: user.lastLogin ? formatTimeAgo(user.lastLogin) : "Never",
          currentLocation: user.currentLocation || null,
          status: user.status || UserStatus.PENDING,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await usersService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          badgeNumber: user.badgeNumber,
          shift: user.shift,
          isActive: user.isActive,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating user",
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await usersService.updateUser(id as string, updateData);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          phoneNumber: user.phoneNumber,
          badgeNumber: user.badgeNumber,
          shift: user.shift,
          profileImage: user.profileImage,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          lastActive: user.lastLogin ? formatTimeAgo(user.lastLogin) : "Never",
          currentLocation: user.currentLocation || null,
          status: user.status || UserStatus.PENDING,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating user",
    });
  }
};

export const getUsersStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await usersService.getUsersStats();

    res.status(200).json({
      success: true,
      message: "Users statistics retrieved successfully",
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving users statistics",
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await usersService.deleteUser(id as string);

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error deactivating user",
    });
  }
};

