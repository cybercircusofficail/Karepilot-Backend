import mongoose, { Document, Schema } from "mongoose";
import AdminUser from "./users";

export interface IDepartment extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Department name must be at least 2 characters long"],
      maxlength: [100, "Department name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

departmentSchema.methods.getUserCount = async function () {
  return await AdminUser.countDocuments({ 
    department: this._id, 
    isActive: true 
  });
};

departmentSchema.index({ isActive: 1 });

const Department = mongoose.model<IDepartment>("Department", departmentSchema);

export default Department;
