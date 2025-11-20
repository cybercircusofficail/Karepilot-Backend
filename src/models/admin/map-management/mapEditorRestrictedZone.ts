"use strict";

import mongoose, { Document, Schema } from "mongoose";
import MapFloorPlan from "./mapFloorPlan";
import AdminUser from "../user-management/users";

export enum RestrictionType {
  STAFF_ONLY = "Staff Only",
  AUTHORIZED_PERSONNEL = "Authorized Personnel",
  EMERGENCY_ACCESS_ONLY = "Emergency Access Only",
}

export interface IMapEditorRestrictedZone extends Document {
  floorPlan: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  restrictionType: RestrictionType;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color?: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const coordinatesSchema = new Schema(
  {
    x: {
      type: Number,
      required: [true, "X coordinate is required"],
    },
    y: {
      type: Number,
      required: [true, "Y coordinate is required"],
    },
    width: {
      type: Number,
      required: [true, "Width is required"],
      min: [1, "Width must be at least 1"],
    },
    height: {
      type: Number,
      required: [true, "Height is required"],
      min: [1, "Height must be at least 1"],
    },
  },
  { _id: false },
);

const mapEditorRestrictedZoneSchema = new Schema<IMapEditorRestrictedZone>(
  {
    floorPlan: {
      type: Schema.Types.ObjectId,
      ref: "MapFloorPlan",
      required: [true, "Floor plan is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Restricted zone name is required"],
      trim: true,
      minlength: [2, "Restricted zone name must be at least 2 characters long"],
      maxlength: [150, "Restricted zone name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    restrictionType: {
      type: String,
      enum: Object.values(RestrictionType),
      required: [true, "Restriction type is required"],
      default: RestrictionType.STAFF_ONLY,
    },
    coordinates: {
      type: coordinatesSchema,
      required: [true, "Coordinates are required"],
    },
    color: {
      type: String,
      trim: true,
      maxlength: [20, "Color cannot exceed 20 characters"],
      default: "#EF4444",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

mapEditorRestrictedZoneSchema.index({ floorPlan: 1, isActive: 1 });

mapEditorRestrictedZoneSchema.pre("save", async function (next) {
  const floorPlan = await MapFloorPlan.findById(this.floorPlan);
  if (!floorPlan) {
    return next(new Error("Floor plan not found"));
  }

  if (this.createdBy) {
    const creator = await AdminUser.findById(this.createdBy);
    if (!creator) {
      return next(new Error("Created by admin not found"));
    }
  }

  if (this.updatedBy) {
    const updater = await AdminUser.findById(this.updatedBy);
    if (!updater) {
      return next(new Error("Updated by admin not found"));
    }
  }

  next();
});

mapEditorRestrictedZoneSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;

  if (update?.floorPlan) {
    const floorPlan = await MapFloorPlan.findById(update.floorPlan);
    if (!floorPlan) {
      return next(new Error("Floor plan not found"));
    }
  }

  if (update?.createdBy) {
    const creator = await AdminUser.findById(update.createdBy);
    if (!creator) {
      return next(new Error("Created by admin not found"));
    }
  }

  if (update?.updatedBy) {
    const updater = await AdminUser.findById(update.updatedBy);
    if (!updater) {
      return next(new Error("Updated by admin not found"));
    }
  }

  next();
});

const MapEditorRestrictedZone = mongoose.model<IMapEditorRestrictedZone>(
  "MapEditorRestrictedZone",
  mapEditorRestrictedZoneSchema,
);

export default MapEditorRestrictedZone;

