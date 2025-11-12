import mongoose, { Document, Schema } from "mongoose";
import Organization from "../organization/organization";
import AdminUser from "../user-management/users";
import MapBuilding from "./mapBuilding";

export interface IMapFloor extends Document {
  organization: mongoose.Types.ObjectId;
  building: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  level: number;
  sequence: number;
  description?: string;
  isBasement: boolean;
  isDefault: boolean;
  tags: string[];
  attributes?: Record<string, any>;
  mapCount: number;
  publishedMapCount: number;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const mapFloorSchema = new Schema<IMapFloor>(
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
    name: {
      type: String,
      required: [true, "Floor name is required"],
      trim: true,
      minlength: [1, "Floor name must be at least 1 character long"],
      maxlength: [120, "Floor name cannot exceed 120 characters"],
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, "Floor code cannot exceed 20 characters"],
    },
    level: {
      type: Number,
      required: [true, "Floor level is required"],
    },
    sequence: {
      type: Number,
      required: [true, "Floor sequence is required"],
      min: [0, "Floor sequence cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isBasement: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.every((tag) => typeof tag === "string" && tag.trim().length > 0),
        message: "All tags must be non-empty strings",
      },
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    mapCount: {
      type: Number,
      default: 0,
      min: [0, "Map count cannot be negative"],
    },
    publishedMapCount: {
      type: Number,
      default: 0,
      min: [0, "Published map count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
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

mapFloorSchema.index({ organization: 1, building: 1, name: 1 }, { unique: true });
mapFloorSchema.index({ organization: 1, building: 1, level: 1 }, { unique: true });
mapFloorSchema.index({ organization: 1, isActive: 1 });
mapFloorSchema.index({ building: 1, sequence: 1 });

mapFloorSchema.pre("save", async function (next) {
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

mapFloorSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;

  if (update?.organization) {
    const organization = await Organization.findById(update.organization);
    if (!organization) {
      return next(new Error("Organization not found"));
    }
  }

  if (update?.building) {
    const building = await MapBuilding.findById(update.building);
    if (!building) {
      return next(new Error("Building not found"));
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

const MapFloor = mongoose.model<IMapFloor>("MapFloor", mapFloorSchema);

export default MapFloor;

