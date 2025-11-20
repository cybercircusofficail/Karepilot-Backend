"use strict";

import mongoose, { Document, Schema } from "mongoose";
import MapFloorPlan from "./mapFloorPlan";
import AdminUser from "../user-management/users";

export interface IMapEditorMeasurement extends Document {
  floorPlan: mongoose.Types.ObjectId;
  startPoint: {
    x: number;
    y: number;
  };
  endPoint: {
    x: number;
    y: number;
  };
  distance: number;
  unit: string;
  color?: string;
  strokeWidth?: number;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const pointSchema = new Schema(
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

const mapEditorMeasurementSchema = new Schema<IMapEditorMeasurement>(
  {
    floorPlan: {
      type: Schema.Types.ObjectId,
      ref: "MapFloorPlan",
      required: [true, "Floor plan is required"],
      index: true,
    },
    startPoint: {
      type: pointSchema,
      required: [true, "Start point is required"],
    },
    endPoint: {
      type: pointSchema,
      required: [true, "End point is required"],
    },
    distance: {
      type: Number,
      required: [true, "Distance is required"],
      min: [0, "Distance must be a positive number"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
      maxlength: [20, "Unit cannot exceed 20 characters"],
      default: "meters",
    },
    color: {
      type: String,
      trim: true,
      maxlength: [20, "Color cannot exceed 20 characters"],
      default: "#2563EB",
    },
    strokeWidth: {
      type: Number,
      min: [1, "Stroke width must be at least 1"],
      max: [20, "Stroke width cannot exceed 20"],
      default: 2,
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

mapEditorMeasurementSchema.index({ floorPlan: 1, isActive: 1 });

mapEditorMeasurementSchema.pre("save", async function (next) {
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

mapEditorMeasurementSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
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

const MapEditorMeasurement = mongoose.model<IMapEditorMeasurement>(
  "MapEditorMeasurement",
  mapEditorMeasurementSchema,
);

export default MapEditorMeasurement;

