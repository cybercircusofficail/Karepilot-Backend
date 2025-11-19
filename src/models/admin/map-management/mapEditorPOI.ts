"use strict";

import mongoose, { Document, Schema } from "mongoose";
import MapFloorPlan from "./mapFloorPlan";
import AdminUser from "../user-management/users";

export interface IMapEditorPOI extends Document {
  floorPlan: mongoose.Types.ObjectId;
  name: string;
  category: string;
  description?: string;
  coordinates: {
    x: number;
    y: number;
  };
  icon?: string;
  color?: string;
  isAccessible?: boolean;
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
  },
  { _id: false },
);

const mapEditorPOISchema = new Schema<IMapEditorPOI>(
  {
    floorPlan: {
      type: Schema.Types.ObjectId,
      ref: "MapFloorPlan",
      required: [true, "Floor plan is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "POI name is required"],
      trim: true,
      minlength: [2, "POI name must be at least 2 characters long"],
      maxlength: [150, "POI name cannot exceed 150 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [120, "Category cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    coordinates: {
      type: coordinatesSchema,
      required: [true, "Coordinates are required"],
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [50, "Icon cannot exceed 50 characters"],
    },
    color: {
      type: String,
      trim: true,
      maxlength: [20, "Color cannot exceed 20 characters"],
    },
    isAccessible: {
      type: Boolean,
      default: true,
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

mapEditorPOISchema.index({ floorPlan: 1, coordinates: 1 });
mapEditorPOISchema.index({ floorPlan: 1, isActive: 1 });
mapEditorPOISchema.index({ floorPlan: 1, category: 1 });

mapEditorPOISchema.pre("save", async function (next) {
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

mapEditorPOISchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
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

const MapEditorPOI = mongoose.model<IMapEditorPOI>("MapEditorPOI", mapEditorPOISchema);

export default MapEditorPOI;

