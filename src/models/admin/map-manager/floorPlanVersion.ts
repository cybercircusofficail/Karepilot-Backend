import mongoose, { Document, Schema } from "mongoose";
import AdminUser from "../user-management/users";
import FloorPlan, {
  IFloorPlanFileMetadata,
  IFloorPlanPreview,
  IFloorPlanSettings,
  IFloorPlanStats,
  floorPlanFileMetadataSchema,
  floorPlanPreviewSchema,
  floorPlanSettingsSchema,
  floorPlanStatsSchema,
} from "./floorPlan";
import { FloorPlanVersionStatus } from "./enums";

export interface IFloorPlanVersionChangeLogEntry {
  action: string;
  message?: string;
  changedBy?: mongoose.Types.ObjectId | null;
  changedAt: Date;
  metadata?: Record<string, any>;
}

export interface IFloorPlanVersion extends Document {
  floorPlan: mongoose.Types.ObjectId;
  versionNumber: number;
  status: FloorPlanVersionStatus;
  name?: string;
  summary?: string;
  file?: IFloorPlanFileMetadata;
  preview?: IFloorPlanPreview;
  stats: IFloorPlanStats;
  canvasSettings: IFloorPlanSettings;
  changeLog: IFloorPlanVersionChangeLogEntry[];
  notes?: string;
  publishedAt?: Date | null;
  publishedBy?: mongoose.Types.ObjectId | null;
  approvalState?: {
    requiresApproval: boolean;
    approvedAt?: Date | null;
    approvedBy?: mongoose.Types.ObjectId | null;
    approvalNotes?: string;
  };
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const changeLogSchema = new Schema(
  {
    action: {
      type: String,
      required: [true, "Change action is required"],
      trim: true,
      maxlength: [120, "Change action cannot exceed 120 characters"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Change message cannot exceed 500 characters"],
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    changedAt: {
      type: Date,
      default: () => new Date(),
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { _id: false },
);

const approvalStateSchema = new Schema(
  {
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    approvalNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Approval notes cannot exceed 500 characters"],
    },
  },
  { _id: false },
);

const floorPlanVersionSchema = new Schema<IFloorPlanVersion>(
  {
    floorPlan: {
      type: Schema.Types.ObjectId,
      ref: "FloorPlan",
      required: [true, "Floor plan reference is required"],
      index: true,
    },
    versionNumber: {
      type: Number,
      required: [true, "Version number is required"],
      min: [1, "Version number must be at least 1"],
    },
    status: {
      type: String,
      enum: Object.values(FloorPlanVersionStatus),
      default: FloorPlanVersionStatus.DRAFT,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [180, "Version name cannot exceed 180 characters"],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [1000, "Summary cannot exceed 1000 characters"],
    },
    file: {
      type: floorPlanFileMetadataSchema,
      default: undefined,
    },
    preview: {
      type: floorPlanPreviewSchema,
      default: undefined,
    },
    stats: {
      type: floorPlanStatsSchema,
      default: () => ({}),
    },
    canvasSettings: {
      type: floorPlanSettingsSchema,
      default: () => ({}),
    },
    changeLog: {
      type: [changeLogSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    approvalState: {
      type: approvalStateSchema,
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

floorPlanVersionSchema.index({ floorPlan: 1, versionNumber: 1 }, { unique: true });
floorPlanVersionSchema.index({ floorPlan: 1, status: 1 });

floorPlanVersionSchema.pre("save", async function (next) {
  if (this.isModified("floorPlan")) {
    const floorPlan = await FloorPlan.findById(this.floorPlan);
    if (!floorPlan) {
      return next(new Error("Floor plan not found"));
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

  if (this.isModified("publishedBy") && this.publishedBy) {
    const publishedByUser = await AdminUser.findById(this.publishedBy);
    if (!publishedByUser) {
      return next(new Error("Published by user not found"));
    }
  }

  if (this.approvalState?.approvedBy) {
    const approver = await AdminUser.findById(this.approvalState.approvedBy);
    if (!approver) {
      return next(new Error("Approved by user not found"));
    }
  }

  next();
});

floorPlanVersionSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;

  if (update?.floorPlan) {
    const floorPlan = await FloorPlan.findById(update.floorPlan);
    if (!floorPlan) {
      return next(new Error("Floor plan not found"));
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

  if (update?.publishedBy) {
    const publishedByUser = await AdminUser.findById(update.publishedBy);
    if (!publishedByUser) {
      return next(new Error("Published by user not found"));
    }
  }

  const approvalState = update?.approvalState;
  if (approvalState?.approvedBy) {
    const approver = await AdminUser.findById(approvalState.approvedBy);
    if (!approver) {
      return next(new Error("Approved by user not found"));
    }
  }

  next();
});

const FloorPlanVersion = mongoose.model<IFloorPlanVersion>("FloorPlanVersion", floorPlanVersionSchema);

export default FloorPlanVersion;

