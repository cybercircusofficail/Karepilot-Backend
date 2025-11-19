"use strict";

import { Types } from "mongoose";
import MapEditorPOI from "../../../models/admin/map-management/mapEditorPOI";
import {
  CreateMapEditorPOIPayload,
  UpdateMapEditorPOIPayload,
  MapEditorPOIQuery,
  MapEditorPOIOverview,
} from "../../../types/admin/map-management/mapEditorPOI";
import { IMapEditorPOI } from "../../../models/admin/map-management/mapEditorPOI";
import MapFloorPlan from "../../../models/admin/map-management/mapFloorPlan";

const toObjectId = (value?: string | null): Types.ObjectId | null => {
  if (!value || !Types.ObjectId.isValid(value)) {
    return null;
  }
  return new Types.ObjectId(value);
};

class MapEditorPOIService {
  private serializePOI(doc: IMapEditorPOI): MapEditorPOIOverview {
    const result: MapEditorPOIOverview = {
      id: (doc as any)._id.toString(),
      floorPlan: {
        id: doc.floorPlan.toString(),
        title: (doc.populated("floorPlan") as any)?.title || "",
        floorLabel: (doc.populated("floorPlan") as any)?.floorLabel || "",
      },
      name: doc.name,
      category: doc.category,
      coordinates: {
        x: doc.coordinates.x,
        y: doc.coordinates.y,
      },
      isAccessible: doc.isAccessible ?? true,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    if (doc.description) {
      result.description = doc.description;
    }
    if (doc.icon) {
      result.icon = doc.icon;
    }
    if (doc.color) {
      result.color = doc.color;
    }

    return result;
  }

  private async getPOIWithRelations(id: string): Promise<IMapEditorPOI | null> {
    return MapEditorPOI.findById(id).populate("floorPlan", "title floorLabel");
  }

  async getPOIsByFloorPlan(query: MapEditorPOIQuery): Promise<MapEditorPOIOverview[]> {
    const floorPlanId = toObjectId(query.floorPlanId);
    if (!floorPlanId) {
      throw new Error("Invalid floor plan ID");
    }

    const dbQuery: Record<string, unknown> = {
      floorPlan: floorPlanId,
      // Default to only active POIs if not explicitly specified
      isActive: typeof query.isActive === "boolean" ? query.isActive : true,
    };

    if (query.category) {
      dbQuery.category = { $regex: new RegExp(query.category, "i") };
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      dbQuery.$or = [
        { name: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    const pois = await MapEditorPOI.find(dbQuery)
      .populate("floorPlan", "title floorLabel")
      .sort({ createdAt: -1 })
      .lean();

    return pois.map((doc: any): MapEditorPOIOverview => {
      const result: MapEditorPOIOverview = {
        id: doc._id.toString(),
        floorPlan: {
          id: doc.floorPlan._id.toString(),
          title: doc.floorPlan.title || "",
          floorLabel: doc.floorPlan.floorLabel || "",
        },
        name: doc.name,
        category: doc.category,
        coordinates: {
          x: doc.coordinates.x,
          y: doc.coordinates.y,
        },
        isAccessible: doc.isAccessible ?? true,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };

      // Only include optional properties if they have values
      if (doc.description) {
        result.description = doc.description;
      }
      if (doc.icon) {
        result.icon = doc.icon;
      }
      if (doc.color) {
        result.color = doc.color;
      }

      return result;
    });
  }

  async getPOIById(id: string): Promise<MapEditorPOIOverview | null> {
    const poi = await this.getPOIWithRelations(id);
    if (!poi) {
      return null;
    }
    return this.serializePOI(poi as any);
  }

  async createPOI(data: CreateMapEditorPOIPayload, adminId: string): Promise<MapEditorPOIOverview> {
    const floorPlanId = toObjectId(data.floorPlanId);
    if (!floorPlanId) {
      throw new Error("Invalid floor plan ID");
    }

    const floorPlan = await MapFloorPlan.findById(floorPlanId);
    if (!floorPlan) {
      throw new Error("Floor plan not found");
    }

    const poi = new MapEditorPOI({
      floorPlan: floorPlanId,
      name: data.name.trim(),
      category: data.category.trim(),
      description: data.description?.trim() || undefined,
      coordinates: {
        x: data.coordinates.x,
        y: data.coordinates.y,
      },
      icon: data.icon?.trim() || undefined,
      color: data.color?.trim() || undefined,
      isAccessible: data.isAccessible ?? true,
      isActive: true,
      createdBy: toObjectId(adminId),
      updatedBy: toObjectId(adminId),
    });

    await poi.save();

    const populated = await this.getPOIWithRelations(poi.id);
    if (!populated) {
      throw new Error("Failed to retrieve created POI");
    }

    return this.serializePOI(populated as any);
  }

  async updatePOI(
    id: string,
    data: UpdateMapEditorPOIPayload,
    adminId: string,
  ): Promise<MapEditorPOIOverview> {
    const poi = await MapEditorPOI.findById(id);
    if (!poi) {
      throw new Error("POI not found");
    }

    if (data.name !== undefined) {
      poi.name = data.name.trim();
    }

    if (data.category !== undefined) {
      poi.category = data.category.trim();
    }

    if (data.description !== undefined) {
      poi.description = data.description?.trim() || "";
    }

    if (data.coordinates !== undefined) {
      poi.coordinates = {
        x: data.coordinates.x,
        y: data.coordinates.y,
      };
    }

    if (data.icon !== undefined) {
      poi.icon = data.icon?.trim() || "";
    }

    if (data.color !== undefined) {
      poi.color = data.color?.trim() || "";
    }

    if (data.isAccessible !== undefined) {
      poi.isAccessible = data.isAccessible;
    }

    if (data.isActive !== undefined) {
      poi.isActive = data.isActive;
    }

    poi.updatedBy = toObjectId(adminId);

    await poi.save();

    const populated = await this.getPOIWithRelations(poi.id);
    if (!populated) {
      throw new Error("Failed to retrieve updated POI");
    }

    return this.serializePOI(populated as any);
  }

  async deletePOI(id: string): Promise<void> {
    const poi = await MapEditorPOI.findById(id);
    if (!poi) {
      throw new Error("POI not found");
    }

    await MapEditorPOI.findByIdAndDelete(id);
  }

  async deletePOIsByFloorPlan(floorPlanId: string): Promise<void> {
    const floorPlanObjectId = toObjectId(floorPlanId);
    if (!floorPlanObjectId) {
      throw new Error("Invalid floor plan ID");
    }

    await MapEditorPOI.deleteMany({ floorPlan: floorPlanObjectId });
  }
}

const mapEditorPOIService = new MapEditorPOIService();

export { mapEditorPOIService };
export default mapEditorPOIService;

