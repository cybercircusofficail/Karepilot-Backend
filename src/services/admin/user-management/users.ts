import { AdminUser, AdminRole } from "../../../models/admin/user-management";
import Department from "../../../models/admin/user-management/departments";
import { CreateUserData, UpdateUserData, UserQuery } from "../../../types/admin/user-management/users";

export class UsersService {
  async getAllUsers(query: UserQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const dbQuery: any = {};

    if (query.role) {
      dbQuery.role = query.role;
    }

    if (query.department) {
      dbQuery.department = query.department;
    }

    if (query.search) {
      dbQuery.$or = [
        { firstName: { $regex: query.search, $options: "i" } },
        { lastName: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { badgeNumber: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.isActive !== undefined) {
      dbQuery.isActive = query.isActive;
    } else {
      dbQuery.isActive = true;
    }

    const skip = (page - 1) * limit;

    const users = await AdminUser.find(dbQuery)
      .select("-password")
      .populate("department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminUser.countDocuments(dbQuery);

    return {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async getUserById(id: string) {
    const user = await AdminUser.findById(id).select("-password").populate("department");
    if (!user || !user.isActive) {
      throw new Error("User not found");
    }
    return user;
  }

  async createUser(data: CreateUserData) {
    const existingUser = await AdminUser.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    if (data.department) {
      const department = await Department.findById(data.department);
      if (!department || !department.isActive) {
        throw new Error("Department not found or inactive");
      }
    }

    const user = new AdminUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || AdminRole.VIEWER,
      department: data.department || null,
      phoneNumber: data.phoneNumber,
      badgeNumber: data.badgeNumber,
      shift: data.shift,
    });

    await user.save();

    const populatedUser = await AdminUser.findById(user._id).populate("department").select("-password");
    return populatedUser!;
  }

  async updateUser(id: string, data: UpdateUserData) {
    const user = await AdminUser.findById(id).select("-password");
    if (!user) {
      throw new Error("User not found");
    }

    if (data.email && data.email.toLowerCase() !== user.email) {
      const existingUser = await AdminUser.findOne({
        email: data.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingUser) {
        throw new Error("Email is already taken by another user");
      }
    }

    if (data.department) {
      const department = await Department.findById(data.department);
      if (!department || !department.isActive) {
        throw new Error("Department not found or inactive");
      }
    }

    const updatedUser = await AdminUser.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("department");

    return updatedUser!;
  }

  async deleteUser(id: string) {
    const user = await AdminUser.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    ).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

export default new UsersService();

