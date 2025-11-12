import mongoose, { Document, Schema } from "mongoose";
import Organization from "../organization/organization";
import AdminUser from "../user-management/users";
import MapBuilding from "./mapBuilding";
import MapFloor from "./mapFloor";
import { FloorPlanStatus } from "./enums";

export interface IFloorPlanFileMetadata {
  storageKey: string;
  fileName: string;
  originalName?: string;
  mimeType: string;
  fileSizeInBytes: number;
  checksum?: string;
  width?: number;
  height?: number;
  uploadedAt: Date;
  url?: string;
}

export interface IFloorPlanPreview {
  url: string;
  width?: number;
  height?: number;
  generatedAt: Date;
}

export interface IFloorPlanStats {
  poiCount: number;
  pathCount: number;
  zoneCount: number;
  labelCount: number;
  entranceCount: number;
  elevatorCount: number;
  restrictedZoneCount: number;
  annotationCount: number;
  draftElementCount: number;
}

export interface IFloorPlanSettings {
  gridSize: number;
  gridUnit: "px" | "ft" | "m";
  snapToGrid: boolean;
  showGrid: boolean;
  defaultZoom: number;
  autoPublish: boolean;
  highResThumbnails: boolean;
  versionControl: boolean;
}

export interface IFloorPlan extends Document {
  organization: mongoose.Types.ObjectId;
  building: mongoose.Types.ObjectId;
  floor: mongoose.Types.ObjectId;
  name: string;
  slug?: string;
  status: FloorPlanStatus;
  description?: string;
  scale?: string;
  tags: string[];
  file?: IFloorPlanFileMetadata;
  preview?: IFloorPlanPreview;
  mapDimensions?: {
    width?: number;
    height?: number;
    unit?: "px" | "ft" | "m";
  };
  stats: IFloorPlanStats;
  settings: IFloorPlanSettings;
  versionNumber: number;
  currentVersion?: mongoose.Types.ObjectId | null;
  publishedVersion?: mongoose.Types.ObjectId | null;
  lastPublishedAt?: Date | null;
  publishOptions?: {
    autoPublish: boolean;
    publishAt?: Date | null;
    requireApproval: boolean;
  };
  isLocked: boolean;
  lockedBy?: mongoose.Types.ObjectId | null;
  lockedAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export const floorPlanFileMetadataSchema = new Schema(
  {
    storageKey: {
      type: String,
      required: [true, "Storage key is required"],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, "Mime type is required"],
      trim: true,
    },
    fileSizeInBytes: {
      type: Number,
      required: [true, "File size is required"],
      min: [0, "File size cannot be negative"],
    },
    checksum: {
      type: String,
      trim: true,
    },
    width: {
      type: Number,
      min: [0, "Width cannot be negative"],
    },
    height: {
      type: Number,
      min: [0, "Height cannot be negative"],
    },
    uploadedAt: {
      type: Date,
      required: [true, "Upload timestamp is required"],
      default: () => new Date(),
    },
    url: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

export const floorPlanPreviewSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "Preview URL is required"],
      trim: true,
    },
    width: {
      type: Number,
      min: [0, "Width cannot be negative"],
    },
    height: {
      type: Number,
      min: [0, "Height cannot be negative"],
    },
    generatedAt: {
      type: Date,
      required: [true, "Generated at timestamp is required"],
      default: () => new Date(),
    },
  },
  { _id: false },
);

export const floorPlanStatsSchema = new Schema(
  {
    poiCount: { type: Number, default: 0, min: 0 },
    pathCount: { type: Number, default: 0, min: 0 },
    zoneCount: { type: Number, default: 0, min: 0 },
    labelCount: { type: Number, default: 0, min: 0 },
    entranceCount: { type: Number, default: 0, min: 0 },
    elevatorCount: { type: Number, default: 0, min: 0 },
    restrictedZoneCount: { type: Number, default: 0, min: 0 },
    annotationCount: { type: Number, default: 0, min: 0 },
    draftElementCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

export const floorPlanSettingsSchema = new Schema(
  {
    gridSize: {
      type: Number,
      default: 20,
      min: [1, "Grid size must be at least 1"],
      max: [500, "Grid size cannot exceed 500"],
    },
    gridUnit: {
      type: String,
      enum: ["px", "ft", "m"],
      default: "px",
    },
    snapToGrid: {
      type: Boolean,
      default: true,
    },
    showGrid: {
      type: Boolean,
      default: true,
    },
    defaultZoom: {
      type: Number,
      default: 100,
      min: [10, "Zoom percentage cannot be less than 10"],
      max: [400, "Zoom percentage cannot exceed 400"],
    },
    autoPublish: {
      type: Boolean,
      default: false,
    },
    highResThumbnails: {
      type: Boolean,
      default: true,
    },
    versionControl: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

export const floorPlanPublishOptionsSchema = new Schema(
  {
    autoPublish: {
      type: Boolean,
      default: false,
    },
    publishAt: {
      type: Date,
      default: null,
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

export const floorPlanDimensionsSchema = new Schema(
  {
    width: {
      type: Number,
      min: [0, "Width cannot be negative"],
    },
    height: {
      type: Number,
      min: [0, "Height cannot be negative"],
    },
    unit: {
      type: String,
      enum: ["px", "ft", "m"],
      default: "px",
    },
  },
  { _id: false },
);

const floorPlanSchema = new Schema<IFloorPlan>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
      index: true,
    },
    building: {
      type: Schema.Types.ObjectId,
      ref: "MapBuilding",
      required: [true, "Building is required"],
      index: true,
    },
    floor: {
      type: Schema.Types.ObjectId,
      ref: "MapFloor",
      required: [true, "Floor is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Floor plan name is required"],
      trim: true,
      minlength: [2, "Floor plan name must be at least 2 characters long"],
      maxlength: [180, "Floor plan name cannot exceed 180 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
    },
    status: {
      type: String,
      enum: Object.values(FloorPlanStatus),
      default: FloorPlanStatus.DRAFT,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    scale: {
      type: String,
      trim: true,
      maxlength: [50, "Scale cannot exceed 50 characters"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.every((tag) => typeof tag === "string" && tag.trim().length > 0),
        message: "All tags must be non-empty strings",
      },
    },
    file: {
      type: floorPlanFileMetadataSchema,
      default: undefined,
    },
    preview: {
      type: floorPlanPreviewSchema,
      default: undefined,
    },
    mapDimensions: {
      type: floorPlanDimensionsSchema,
      default: undefined,
    },
    stats: {
      type: floorPlanStatsSchema,
      default: () => ({}),
    },
    settings: {
      type: floorPlanSettingsSchema,
      default: () => ({}),
    },
    versionNumber: {
      type: Number,
      default: 1,
      min: [1, "Version number must be at least 1"],
    },
    currentVersion: {
      type: Schema.Types.ObjectId,
      ref: "FloorPlanVersion",
      default: null,
    },
    publishedVersion: {
      type: Schema.Types.ObjectId,
      ref: "FloorPlanVersion",
      default: null,
    },
    lastPublishedAt: {
      type: Date,
      default: null,
    },
    publishOptions: {
      type: floorPlanPublishOptionsSchema,
      default: undefined,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
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

floorPlanSchema.index({ organization: 1, building: 1, floor: 1, name: 1 }, { unique: true });
floorPlanSchema.index({ organization: 1, status: 1 });
floorPlanSchema.index({ organization: 1, tags: 1 });
floorPlanSchema.index({ building: 1, floor: 1, status: 1 });

floorPlanSchema.pre("save", async function (next) {
  if (this.isModified("organization")) {
    const organization = await Organization.findById(this.organization);
    if (!organization) {
      return next(new Error("Organization not found"));
    }
  }

  if (this.isModified("building")) {
    const building = await MapBuilding.findById(this.building);
    if (!building) {
      return next(new Error("Building not found"));
    }
    if (building.organization.toString() !== this.organization.toString()) {
      return next(new Error("Building does not belong to the specified organization"));
    }
  }

  if (this.isModified("floor")) {
    const floor = await MapFloor.findById(this.floor);
    if (!floor) {
      return next(new Error("Floor not found"));
    }
    if (floor.building.toString() !== this.building.toString()) {
      return next(new Error("Floor does not belong to the specified building"));
    }
    if (floor.organization.toString() !== this.organization.toString()) {
      return next(new Error("Floor does not belong to the specified organization"));
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

floorPlanSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;

  if (update?.organization) {
    const organization = await Organization.findById(update.organization);
    if (!organization) {
      return next(new Error("Organization not found"));
    }
  }

  const buildingId = update?.building;
  const floorId = update?.floor;
  const organizationId = update?.organization;

  if (buildingId) {
    const building = await MapBuilding.findById(buildingId);
    if (!building) {
      return next(new Error("Building not found"));
    }

    if (organizationId && building.organization.toString() !== organizationId.toString()) {
      return next(new Error("Building does not belong to the specified organization"));
    }
  }

  if (floorId) {
    const floor = await MapFloor.findById(floorId);
    if (!floor) {
      return next(new Error("Floor not found"));
    }

    if (buildingId && floor.building.toString() !== buildingId.toString()) {
      return next(new Error("Floor does not belong to the specified building"));
    }

    if (organizationId && floor.organization.toString() !== organizationId.toString()) {
      return next(new Error("Floor does not belong to the specified organization"));
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

const FloorPlan = mongoose.model<IFloorPlan>("FloorPlan", floorPlanSchema);

export default FloorPlan;

