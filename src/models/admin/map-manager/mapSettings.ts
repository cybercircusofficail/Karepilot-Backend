import mongoose, { Document, Schema } from "mongoose";
import Organization from "../organization/organization";
import AdminUser from "../user-management/users";
import { MapLayerType } from "./enums";

export interface IMapManagerSettings extends Document {
  organization: mongoose.Types.ObjectId;
  autoPublishUpdates: boolean;
  highResThumbnails: boolean;
  enableVersionControl: boolean;
  defaultGridSize: number;
  defaultGridUnit: "px" | "ft" | "m";
  defaultSnapToGrid: boolean;
  defaultShowGrid: boolean;
  defaultZoom: number;
  defaultMapScale?: string;
  allowedFileTypes: string[];
  maxUploadSizeMb: number;
  defaultLayerVisibility: Partial<Record<MapLayerType, boolean>>;
  notificationPreferences?: {
    publishSuccess?: boolean;
    publishFailure?: boolean;
    approvalRequired?: boolean;
  };
  retentionPolicy?: {
    keepDraftVersions: number;
    keepPublishedSnapshots: number;
  };
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferencesSchema = new Schema(
  {
    publishSuccess: {
      type: Boolean,
      default: true,
    },
    publishFailure: {
      type: Boolean,
      default: true,
    },
    approvalRequired: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const retentionPolicySchema = new Schema(
  {
    keepDraftVersions: {
      type: Number,
      default: 10,
      min: [0, "Draft retention cannot be negative"],
    },
    keepPublishedSnapshots: {
      type: Number,
      default: 5,
      min: [0, "Published retention cannot be negative"],
    },
  },
  { _id: false },
);

const mapManagerSettingsSchema = new Schema<IMapManagerSettings>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
      unique: true,
      index: true,
    },
    autoPublishUpdates: {
      type: Boolean,
      default: false,
    },
    highResThumbnails: {
      type: Boolean,
      default: true,
    },
    enableVersionControl: {
      type: Boolean,
      default: true,
    },
    defaultGridSize: {
      type: Number,
      default: 20,
      min: [1, "Grid size must be at least 1"],
      max: [500, "Grid size cannot exceed 500"],
    },
    defaultGridUnit: {
      type: String,
      enum: ["px", "ft", "m"],
      default: "px",
    },
    defaultSnapToGrid: {
      type: Boolean,
      default: true,
    },
    defaultShowGrid: {
      type: Boolean,
      default: true,
    },
    defaultZoom: {
      type: Number,
      default: 100,
      min: [10, "Zoom percentage cannot be less than 10"],
      max: [400, "Zoom percentage cannot exceed 400"],
    },
    defaultMapScale: {
      type: String,
      trim: true,
      maxlength: [50, "Default map scale cannot exceed 50 characters"],
    },
    allowedFileTypes: {
      type: [String],
      default: ["pdf", "png", "jpg", "jpeg", "svg", "dwg", "cad"],
    },
    maxUploadSizeMb: {
      type: Number,
      default: 50,
      min: [1, "Maximum upload size must be at least 1MB"],
      max: [500, "Maximum upload size cannot exceed 500MB"],
    },
    defaultLayerVisibility: {
      type: Map,
      of: Boolean,
      default: () =>
        new Map([
          [MapLayerType.FLOOR_PLAN, true],
          [MapLayerType.POI, true],
          [MapLayerType.PATH, true],
          [MapLayerType.ZONE, true],
          [MapLayerType.LABEL, true],
          [MapLayerType.ENTRANCE, true],
          [MapLayerType.ELEVATOR, true],
          [MapLayerType.RESTRICTED_ZONE, true],
          [MapLayerType.TAG, true],
          [MapLayerType.RULER, false],
          [MapLayerType.MEASUREMENT, false],
          [MapLayerType.ANNOTATION, true],
          [MapLayerType.MESSAGE, true],
          [MapLayerType.MEDIA, false],
        ]),
    },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    retentionPolicy: {
      type: retentionPolicySchema,
      default: () => ({}),
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

mapManagerSettingsSchema.pre("save", async function (next) {
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

mapManagerSettingsSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
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

const MapManagerSettings = mongoose.model<IMapManagerSettings>("MapManagerSettings", mapManagerSettingsSchema);

export default MapManagerSettings;

