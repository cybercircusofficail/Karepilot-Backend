"use strict";

import mongoose, { Document, Schema } from "mongoose";
import MapFloorPlan from "./mapFloorPlan";
import AdminUser from "../user-management/users";

export interface IMapEditorElevator extends Document {
  floorPlan: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  coordinates: {
    x: number;
    y: number;
  };
  connectsToFloors: string[];
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

const mapEditorElevatorSchema = new Schema<IMapEditorElevator>(
  {
    floorPlan: {
      type: Schema.Types.ObjectId,
      ref: "MapFloorPlan",
      required: [true, "Floor plan is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Elevator name is required"],
      trim: true,
      minlength: [2, "Elevator name must be at least 2 characters long"],
      maxlength: [150, "Elevator name cannot exceed 150 characters"],
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
    connectsToFloors: {
      type: [String],
      required: [true, "Connected floors are required"],
      validate: {
        validator: function (floors: string[]) {
          return floors.length > 0;
        },
        message: "At least one floor connection is required",
      },
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
      default: "#7C3AED",
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

mapEditorElevatorSchema.index({ floorPlan: 1, isActive: 1 });
mapEditorElevatorSchema.index({ floorPlan: 1, name: 1 });

const MapEditorElevator = mongoose.model<IMapEditorElevator>(
  "MapEditorElevator",
  mapEditorElevatorSchema,
);

export default MapEditorElevator;
