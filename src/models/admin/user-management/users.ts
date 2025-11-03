import mongoose, { Document, Schema } from "mongoose";
import * as bcrypt from "bcryptjs";
import { AdminRole } from "./roles-permissions";
import Department from "./departments";

export interface IAdminUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AdminRole;
  department?: mongoose.Types.ObjectId | null;
  phoneNumber?: string;
  badgeNumber?: string;
  shift?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  currentLocation?: string; 
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.VIEWER,
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: false,
      default: null,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    badgeNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    shift: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    currentLocation: {
      type: String,
      trim: true,
      default: "ICU Level 3",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const { password, ...userWithoutPassword } = ret;
        return userWithoutPassword;
      },
    },
  },
);

adminUserSchema.index({ role: 1 });
adminUserSchema.index({ isActive: 1 });
adminUserSchema.index({ department: 1 });

adminUserSchema.pre("save", async function (next) {
  if (this.role === AdminRole.ADMIN) {
    this.set("department", undefined);
  }
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    if (this.department) {
      const department = await Department.findById(this.department);
      if (!department || !department.isActive) {
        return next(new Error("Department not found or inactive"));
      }
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

adminUserSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;
  if (update?.role === AdminRole.ADMIN) {
    update.$unset = update.$unset || {};
    update.$unset.department = "";
    delete update.department;
  }
  if (update?.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
    } catch (error: any) {
      return next(error);
    }
  }
  if (update?.department) {
    const department = await Department.findById(update.department);
    if (!department || !department.isActive) {
      return next(new Error("Department not found or inactive"));
    }
  }
  next();
});

adminUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const AdminUser = mongoose.model<IAdminUser>("AdminUser", adminUserSchema);

export default AdminUser;

