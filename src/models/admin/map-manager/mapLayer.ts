import mongoose, { Document, Schema } from "mongoose";
import AdminUser from "../user-management/users";
import FloorPlanVersion from "./floorPlanVersion";
import { MapLayerType } from "./enums";

export interface IMapLayerStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  icon?: string;
  iconColor?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  textColor?: string;
}

export interface IMapLayer extends Document {
  floorPlanVersion: mongoose.Types.ObjectId;
  name: string;
  type: MapLayerType;
  order: number;
  isVisible: boolean;
  isLocked: boolean;
  style?: IMapLayerStyle;
  metadata?: Record<string, any>;
  elementCounts: {
    total: number;
    draft: number;
    published: number;
  };
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const layerStyleSchema = new Schema(
  {
    fillColor: {
      type: String,
      trim: true,
    },
    strokeColor: {
      type: String,
      trim: true,
    },
    strokeWidth: {
      type: Number,
      min: [0, "Stroke width cannot be negative"],
    },
    opacity: {
      type: Number,
      min: [0, "Opacity cannot be less than 0"],
      max: [1, "Opacity cannot be greater than 1"],
    },
    icon: {
      type: String,
      trim: true,
    },
    iconColor: {
      type: String,
      trim: true,
    },
    fontSize: {
      type: Number,
      min: [1, "Font size must be at least 1"],
      max: [200, "Font size cannot exceed 200"],
    },
    fontWeight: {
      type: String,
      enum: ["normal", "bold"],
      default: "normal",
    },
    textColor: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const layerElementCountsSchema = new Schema(
  {
    total: {
      type: Number,
      default: 0,
      min: [0, "Element count cannot be negative"],
    },
    draft: {
      type: Number,
      default: 0,
      min: [0, "Draft count cannot be negative"],
    },
    published: {
      type: Number,
      default: 0,
      min: [0, "Published count cannot be negative"],
    },
  },
  { _id: false },
);

const mapLayerSchema = new Schema<IMapLayer>(
  {
    floorPlanVersion: {
      type: Schema.Types.ObjectId,
      ref: "FloorPlanVersion",
      required: [true, "Floor plan version is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Layer name is required"],
      trim: true,
      minlength: [2, "Layer name must be at least 2 characters long"],
      maxlength: [120, "Layer name cannot exceed 120 characters"],
    },
    type: {
      type: String,
      enum: Object.values(MapLayerType),
      required: [true, "Layer type is required"],
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Layer order cannot be negative"],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    style: {
      type: layerStyleSchema,
      default: undefined,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    elementCounts: {
      type: layerElementCountsSchema,
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

mapLayerSchema.index({ floorPlanVersion: 1, type: 1, order: 1 });
mapLayerSchema.index({ floorPlanVersion: 1, name: 1 }, { unique: true });

mapLayerSchema.pre("save", async function (next) {
  if (this.isModified("floorPlanVersion")) {
    const version = await FloorPlanVersion.findById(this.floorPlanVersion);
    if (!version) {
      return next(new Error("Floor plan version not found"));
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

mapLayerSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;

  if (update?.floorPlanVersion) {
    const version = await FloorPlanVersion.findById(update.floorPlanVersion);
    if (!version) {
      return next(new Error("Floor plan version not found"));
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

const MapLayer = mongoose.model<IMapLayer>("MapLayer", mapLayerSchema);

export default MapLayer;

