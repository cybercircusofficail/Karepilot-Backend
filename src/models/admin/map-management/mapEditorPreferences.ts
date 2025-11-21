"use strict";

import mongoose, { Document, Schema } from "mongoose";
import AdminUser from "../user-management/users";

export interface IMapEditorPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  layerVisibility: {
    floorPlan: boolean;
    pois: boolean;
    paths: boolean;
    zones: boolean;
    labels: boolean;
  };
  properties: {
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const mapEditorPreferencesSchema = new Schema<IMapEditorPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    layerVisibility: {
      floorPlan: {
        type: Boolean,
        default: true,
      },
      pois: {
        type: Boolean,
        default: true,
      },
      paths: {
        type: Boolean,
        default: true,
      },
      zones: {
        type: Boolean,
        default: true,
      },
      labels: {
        type: Boolean,
        default: true,
      },
    },
    properties: {
      gridSize: {
        type: Number,
        default: 10,
        min: [5, "Grid size must be at least 5px"],
        max: [50, "Grid size cannot exceed 50px"],
      },
      snapToGrid: {
        type: Boolean,
        default: true,
      },
      showGrid: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

mapEditorPreferencesSchema.pre("save", async function (next) {
  const user = await AdminUser.findById(this.userId);
  if (!user) {
    return next(new Error("User not found"));
  }
  next();
});

const MapEditorPreferences = mongoose.model<IMapEditorPreferences>(
  "MapEditorPreferences",
  mapEditorPreferencesSchema
);

export default MapEditorPreferences;

