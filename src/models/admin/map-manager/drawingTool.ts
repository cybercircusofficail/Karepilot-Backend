import mongoose, { Document, Schema } from "mongoose";
import Organization from "../organization/organization";
import AdminUser from "../user-management/users";
import { DrawingToolCategory, MapElementType, MapLayerType } from "./enums";

export interface IDrawingToolConfig {
  defaultLayerType?: MapLayerType;
  defaultElementType?: MapElementType;
  defaultProperties?: Record<string, any>;
  shortcutKeys?: string[];
  allowedRoles?: string[];
  requiresApproval?: boolean;
}

export interface IDrawingTool extends Document {
  organization: mongoose.Types.ObjectId;
  name: string;
  key: string;
  description?: string;
  category: DrawingToolCategory;
  icon?: string;
  color?: string;
  order: number;
  isSystem: boolean;
  isActive: boolean;
  config?: IDrawingToolConfig;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const drawingToolConfigSchema = new Schema(
  {
    defaultLayerType: {
      type: String,
      enum: Object.values(MapLayerType),
    },
    defaultElementType: {
      type: String,
      enum: Object.values(MapElementType),
    },
    defaultProperties: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    shortcutKeys: {
      type: [String],
      default: undefined,
    },
    allowedRoles: {
      type: [String],
      default: undefined,
    },
    requiresApproval: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const drawingToolSchema = new Schema<IDrawingTool>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tool name is required"],
      trim: true,
      minlength: [2, "Tool name must be at least 2 characters long"],
      maxlength: [120, "Tool name cannot exceed 120 characters"],
    },
    key: {
      type: String,
      required: [true, "Tool key is required"],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Key can only contain lowercase letters, numbers, and hyphens"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: Object.values(DrawingToolCategory),
      default: DrawingToolCategory.BASIC,
    },
    icon: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    config: {
      type: drawingToolConfigSchema,
      default: undefined,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

drawingToolSchema.index({ organization: 1, key: 1 }, { unique: true });
drawingToolSchema.index({ organization: 1, order: 1 });
drawingToolSchema.index({ organization: 1, category: 1 });

drawingToolSchema.pre("save", async function (next) {
  if (this.isModified("organization")) {
    const organization = await Organization.findById(this.organization);
    if (!organization) {
      return next(new Error("Organization not found"));
    }
  }

  if (this.isModified("createdBy") && this.createdBy) {
    const createdByUser = await AdminUser.findById(this.createdBy);
    if (!createdByUser) {
      return next(new Error("Created by user not found"));
    }
  }

  if (this.isModified("updatedBy") && this.updatedBy) {
    const updatedByUser = await AdminUser.findById(this.updatedBy);
    if (!updatedByUser) {
      return next(new Error("Updated by user not found"));
    }
  }

  next();
});

drawingToolSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;

  if (update?.organization) {
    const organization = await Organization.findById(update.organization);
    if (!organization) {
      return next(new Error("Organization not found"));
    }
  }

  if (update?.createdBy) {
    const createdByUser = await AdminUser.findById(update.createdBy);
    if (!createdByUser) {
      return next(new Error("Created by user not found"));
    }
  }

  if (update?.updatedBy) {
    const updatedByUser = await AdminUser.findById(update.updatedBy);
    if (!updatedByUser) {
      return next(new Error("Updated by user not found"));
    }
  }

  next();
});

const DrawingTool = mongoose.model<IDrawingTool>("DrawingTool", drawingToolSchema);

export default DrawingTool;

