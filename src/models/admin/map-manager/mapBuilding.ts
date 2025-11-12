import mongoose, { Document, Schema } from "mongoose";
import Organization from "../organization/organization";
import AdminUser from "../user-management/users";

export interface IMapBuilding extends Document {
  organization: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  description?: string;
  tags: string[];
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  geoLocation?: {
    latitude?: number;
    longitude?: number;
  };
  defaultFloor?: mongoose.Types.ObjectId | null;
  floorCount: number;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema(
  {
    line1: {
      type: String,
      trim: true,
      maxlength: [200, "Address line 1 cannot exceed 200 characters"],
    },
    line2: {
      type: String,
      trim: true,
      maxlength: [200, "Address line 2 cannot exceed 200 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [120, "City cannot exceed 120 characters"],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [120, "State cannot exceed 120 characters"],
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, "Postal code cannot exceed 20 characters"],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [120, "Country cannot exceed 120 characters"],
    },
  },
  { _id: false },
);

const geoLocationSchema = new Schema(
  {
    latitude: {
      type: Number,
      min: [-90, "Latitude cannot be less than -90"],
      max: [90, "Latitude cannot be greater than 90"],
    },
    longitude: {
      type: Number,
      min: [-180, "Longitude cannot be less than -180"],
      max: [180, "Longitude cannot be greater than 180"],
    },
  },
  { _id: false },
);

const mapBuildingSchema = new Schema<IMapBuilding>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Building name is required"],
      trim: true,
      minlength: [2, "Building name must be at least 2 characters long"],
      maxlength: [180, "Building name cannot exceed 180 characters"],
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, "Building code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.every((tag) => typeof tag === "string" && tag.trim().length > 0),
        message: "All tags must be non-empty strings",
      },
    },
    address: {
      type: addressSchema,
      default: undefined,
    },
    geoLocation: {
      type: geoLocationSchema,
      default: undefined,
    },
    defaultFloor: {
      type: Schema.Types.ObjectId,
      ref: "MapFloor",
      default: null,
    },
    floorCount: {
      type: Number,
      default: 0,
      min: [0, "Floor count cannot be negative"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
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

mapBuildingSchema.index({ organization: 1, name: 1 }, { unique: true });
mapBuildingSchema.index({ organization: 1, code: 1 }, { unique: true, sparse: true });
mapBuildingSchema.index({ organization: 1, isActive: 1 });

mapBuildingSchema.pre("save", async function (next) {
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

mapBuildingSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
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

const MapBuilding = mongoose.model<IMapBuilding>("MapBuilding", mapBuildingSchema);

export default MapBuilding;

