"use strict";

import { Types } from "mongoose";
import MapEditorMeasurement from "../../../models/admin/map-management/mapEditorMeasurement";
import {
  CreateMapEditorMeasurementPayload,
  UpdateMapEditorMeasurementPayload,
  MapEditorMeasurementQuery,
  MapEditorMeasurementOverview,
} from "../../../types/admin/map-management/mapEditorMeasurement";
import { IMapEditorMeasurement } from "../../../models/admin/map-management/mapEditorMeasurement";
import MapFloorPlan from "../../../models/admin/map-management/mapFloorPlan";

const toObjectId = (value?: string | null): Types.ObjectId | null => {
  if (!value || !Types.ObjectId.isValid(value)) {
    return null;
  }
  return new Types.ObjectId(value);
};

class MapEditorMeasurementService {
  private serializeMeasurement(doc: IMapEditorMeasurement): MapEditorMeasurementOverview {
    const result: MapEditorMeasurementOverview = {
      id: (doc as any)._id.toString(),
      floorPlan: {
        id: doc.floorPlan.toString(),
        title: (doc.populated("floorPlan") as any)?.title || "",
        floorLabel: (doc.populated("floorPlan") as any)?.floorLabel || "",
      },
      startPoint: {
        x: doc.startPoint.x,
        y: doc.startPoint.y,
      },
      endPoint: {
        x: doc.endPoint.x,
        y: doc.endPoint.y,
      },
      distance: doc.distance,
      unit: doc.unit,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    if (doc.color) {
      result.color = doc.color;
    }
    if (doc.strokeWidth) {
      result.strokeWidth = doc.strokeWidth;
    }

    return result;
  }

  private async getMeasurementWithRelations(id: string): Promise<IMapEditorMeasurement | null> {
    return MapEditorMeasurement.findById(id).populate("floorPlan", "title floorLabel");
  }

  async getMeasurementsByFloorPlan(
    query: MapEditorMeasurementQuery,
  ): Promise<MapEditorMeasurementOverview[]> {
    const floorPlanId = toObjectId(query.floorPlanId);
    if (!floorPlanId) {
      throw new Error("Invalid floor plan ID");
    }

    const dbQuery: Record<string, unknown> = {
      floorPlan: floorPlanId,
      isActive: typeof query.isActive === "boolean" ? query.isActive : true,
    };

    const measurements = await MapEditorMeasurement.find(dbQuery)
      .populate("floorPlan", "title floorLabel")
      .sort({ createdAt: -1 })
      .lean();

    return measurements.map((doc: any): MapEditorMeasurementOverview => {
      const result: MapEditorMeasurementOverview = {
        id: doc._id.toString(),
        floorPlan: {
          id: doc.floorPlan._id.toString(),
          title: doc.floorPlan.title || "",
          floorLabel: doc.floorPlan.floorLabel || "",
        },
        startPoint: {
          x: doc.startPoint.x,
          y: doc.startPoint.y,
        },
        endPoint: {
          x: doc.endPoint.x,
          y: doc.endPoint.y,
        },
        distance: doc.distance,
        unit: doc.unit,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };

      if (doc.color) {
        result.color = doc.color;
      }
      if (doc.strokeWidth) {
        result.strokeWidth = doc.strokeWidth;
      }

      return result;
    });
  }

  async getMeasurementById(id: string): Promise<MapEditorMeasurementOverview | null> {
    const measurement = await this.getMeasurementWithRelations(id);
    if (!measurement) {
      return null;
    }
    return this.serializeMeasurement(measurement as any);
  }

  async createMeasurement(
    data: CreateMapEditorMeasurementPayload,
    adminId: string,
  ): Promise<MapEditorMeasurementOverview> {
    const floorPlanId = toObjectId(data.floorPlanId);
    if (!floorPlanId) {
      throw new Error("Invalid floor plan ID");
    }

    const floorPlan = await MapFloorPlan.findById(floorPlanId);
    if (!floorPlan) {
      throw new Error("Floor plan not found");
    }

    const measurement = new MapEditorMeasurement({
      floorPlan: floorPlanId,
      startPoint: {
        x: data.startPoint.x,
        y: data.startPoint.y,
      },
      endPoint: {
        x: data.endPoint.x,
        y: data.endPoint.y,
      },
      distance: data.distance,
      unit: data.unit || "meters",
      color: data.color?.trim() || "#2563EB",
      strokeWidth: data.strokeWidth || 2,
      isActive: true,
      createdBy: toObjectId(adminId),
      updatedBy: toObjectId(adminId),
    });

    await measurement.save();

    const populated = await this.getMeasurementWithRelations(measurement.id);
    if (!populated) {
      throw new Error("Failed to retrieve created measurement");
    }

    return this.serializeMeasurement(populated as any);
  }

  async updateMeasurement(
    id: string,
    data: UpdateMapEditorMeasurementPayload,
    adminId: string,
  ): Promise<MapEditorMeasurementOverview> {
    const measurement = await MapEditorMeasurement.findById(id);
    if (!measurement) {
      throw new Error("Measurement not found");
    }

    if (data.startPoint !== undefined) {
      measurement.startPoint = {
        x: data.startPoint.x,
        y: data.startPoint.y,
      };
    }

    if (data.endPoint !== undefined) {
      measurement.endPoint = {
        x: data.endPoint.x,
        y: data.endPoint.y,
      };
    }

    if (data.distance !== undefined) {
      measurement.distance = data.distance;
    }

    if (data.unit !== undefined) {
      measurement.unit = data.unit;
    }

    if (data.color !== undefined) {
      measurement.color = data.color?.trim() || "#2563EB";
    }

    if (data.strokeWidth !== undefined) {
      measurement.strokeWidth = data.strokeWidth;
    }

    if (data.isActive !== undefined) {
      measurement.isActive = data.isActive;
    }

    measurement.updatedBy = toObjectId(adminId);

    await measurement.save();

    const populated = await this.getMeasurementWithRelations(measurement.id);
    if (!populated) {
      throw new Error("Failed to retrieve updated measurement");
    }

    return this.serializeMeasurement(populated as any);
  }

  async deleteMeasurement(id: string): Promise<void> {
    const measurement = await MapEditorMeasurement.findById(id);
    if (!measurement) {
      throw new Error("Measurement not found");
    }

    await MapEditorMeasurement.findByIdAndDelete(id);
  }

  async deleteMeasurementsByFloorPlan(floorPlanId: string): Promise<void> {
    const floorPlanObjectId = toObjectId(floorPlanId);
    if (!floorPlanObjectId) {
      throw new Error("Invalid floor plan ID");
    }

    await MapEditorMeasurement.deleteMany({ floorPlan: floorPlanObjectId });
  }
}

const mapEditorMeasurementService = new MapEditorMeasurementService();

export { mapEditorMeasurementService };
export default mapEditorMeasurementService;

