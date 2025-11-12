import mongoose, { Document, Schema } from "mongoose";
import AdminUser from "../user-management/users";
import FloorPlanVersion from "./floorPlanVersion";
import MapLayer from "./mapLayer";
import { MapElementStatus, MapElementType } from "./enums";

export type GeometryType = "Point" | "LineString" | "Polygon" | "MultiPolygon";

export interface IMapElementGeometry {
  type: GeometryType;
  coordinates: any;
}

export interface IMapElementCanvasGeometry {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  radius?: number;
  points?: number[];
}

export interface IMapElement extends Document {
  floorPlanVersion: mongoose.Types.ObjectId;
  layer?: mongoose.Types.ObjectId | null;
  type: MapElementType;
  status: MapElementStatus;
  name?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  tags: string[];
  geometry?: IMapElementGeometry;
  canvasGeometry?: IMapElementCanvasGeometry;
  properties: Record<string, any>;
  accessibility?: {
    wheelchairAccessible?: boolean;
    visualAidSupport?: boolean;
    notes?: string;
  };
  connectedFloors?: mongoose.Types.ObjectId[];
  isVisible: boolean;
  isLocked: boolean;
  displayOrder: number;
  sourceToolKey?: string;
  metadata?: Record<string, any>;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const geometrySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point", "LineString", "Polygon", "MultiPolygon"],
      required: [true, "Geometry type is required"],
    },
    coordinates: {
      type: Schema.Types.Mixed,
      required: [true, "Geometry coordinates are required"],
    },
  },
  { _id: false },
);

const canvasGeometrySchema = new Schema(
  {
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
    rotation: { type: Number },
    radius: { type: Number },
    points: { type: [Number], default: undefined },
  },
  { _id: false },
);

const accessibilitySchema = new Schema(
  {
    wheelchairAccessible: {
      type: Boolean,
      default: undefined,
    },
    visualAidSupport: {
      type: Boolean,
      default: undefined,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Accessibility notes cannot exceed 500 characters"],
    },
  },
  { _id: false },
);

const mapElementSchema = new Schema<IMapElement>(
  {
    floorPlanVersion: {
      type: Schema.Types.ObjectId,
      ref: "FloorPlanVersion",
      required: [true, "Floor plan version is required"],
      index: true,
    },
    layer: {
      type: Schema.Types.ObjectId,
      ref: "MapLayer",
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(MapElementType),
      required: [true, "Element type is required"],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(MapElementStatus),
      default: MapElementStatus.DRAFT,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [180, "Element name cannot exceed 180 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [120, "Category cannot exceed 120 characters"],
    },
    subCategory: {
      type: String,
      trim: true,
      maxlength: [120, "Sub-category cannot exceed 120 characters"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.every((tag) => typeof tag === "string" && tag.trim().length > 0),
        message: "All tags must be non-empty strings",
      },
    },
    geometry: {
      type: geometrySchema,
      default: undefined,
    },
    canvasGeometry: {
      type: canvasGeometrySchema,
      default: undefined,
    },
    properties: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    accessibility: {
      type: accessibilitySchema,
      default: undefined,
    },
    connectedFloors: {
      type: [Schema.Types.ObjectId],
      ref: "MapFloor",
      default: undefined,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative"],
    },
    sourceToolKey: {
      type: String,
      trim: true,
      maxlength: [120, "Source tool key cannot exceed 120 characters"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
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

mapElementSchema.index({ floorPlanVersion: 1, layer: 1, displayOrder: 1 });
mapElementSchema.index({ floorPlanVersion: 1, type: 1 });
mapElementSchema.index({ floorPlanVersion: 1, status: 1 });

mapElementSchema.pre("save", async function (next) {
  if (this.isModified("floorPlanVersion")) {
    const version = await FloorPlanVersion.findById(this.floorPlanVersion);
    if (!version) {
      return next(new Error("Floor plan version not found"));
    }
  }

  if (this.layer) {
    const layer = await MapLayer.findById(this.layer);
    if (!layer) {
      return next(new Error("Layer not found"));
    }
    if (layer.floorPlanVersion.toString() !== this.floorPlanVersion.toString()) {
      return next(new Error("Layer does not belong to the specified floor plan version"));
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

mapElementSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;

  if (update?.floorPlanVersion) {
    const version = await FloorPlanVersion.findById(update.floorPlanVersion);
    if (!version) {
      return next(new Error("Floor plan version not found"));
    }
  }

  if (update?.layer) {
    const layer = await MapLayer.findById(update.layer);
    if (!layer) {
      return next(new Error("Layer not found"));
    }
    if (update?.floorPlanVersion && layer.floorPlanVersion.toString() !== update.floorPlanVersion.toString()) {
      return next(new Error("Layer does not belong to the specified floor plan version"));
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

const MapElement = mongoose.model<IMapElement>("MapElement", mapElementSchema);

export default MapElement;

