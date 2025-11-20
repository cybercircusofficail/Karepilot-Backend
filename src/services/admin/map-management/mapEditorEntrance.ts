"use strict";

import { Types } from "mongoose";
import MapEditorEntrance from "../../../models/admin/map-management/mapEditorEntrance";
import {
  CreateMapEditorEntrancePayload,
  UpdateMapEditorEntrancePayload,
  MapEditorEntranceQuery,
  MapEditorEntranceOverview,
} from "../../../types/admin/map-management/mapEditorEntrance";
import { IMapEditorEntrance } from "../../../models/admin/map-management/mapEditorEntrance";
import MapFloorPlan from "../../../models/admin/map-management/mapFloorPlan";

const toObjectId = (value?: string | null): Types.ObjectId | null => {
  if (!value || !Types.ObjectId.isValid(value)) {
    return null;
  }
  return new Types.ObjectId(value);
};

class MapEditorEntranceService {
  private serializeEntrance(doc: IMapEditorEntrance): MapEditorEntranceOverview {
    const result: MapEditorEntranceOverview = {
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

  private async getEntranceWithRelations(id: string): Promise<IMapEditorEntrance | null> {
    return MapEditorEntrance.findById(id).populate("floorPlan", "title floorLabel");
  }

  async getEntrancesByFloorPlan(query: MapEditorEntranceQuery): Promise<MapEditorEntranceOverview[]> {
    const floorPlanId = toObjectId(query.floorPlanId);
    if (!floorPlanId) {
      throw new Error("Invalid floor plan ID");
    }

    const dbQuery: Record<string, unknown> = {
      floorPlan: floorPlanId,
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

    const entrances = await MapEditorEntrance.find(dbQuery)
      .populate("floorPlan", "title floorLabel")
      .sort({ createdAt: -1 })
      .lean();

    return entrances.map((doc: any): MapEditorEntranceOverview => {
      const result: MapEditorEntranceOverview = {
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

  async getEntranceById(id: string): Promise<MapEditorEntranceOverview | null> {
    const entrance = await this.getEntranceWithRelations(id);
    if (!entrance) {
      return null;
    }
    return this.serializeEntrance(entrance as any);
  }

  async createEntrance(
    data: CreateMapEditorEntrancePayload,
    adminId: string,
  ): Promise<MapEditorEntranceOverview> {
    const floorPlanId = toObjectId(data.floorPlanId);
    if (!floorPlanId) {
      throw new Error("Invalid floor plan ID");
    }

    const floorPlan = await MapFloorPlan.findById(floorPlanId);
    if (!floorPlan) {
      throw new Error("Floor plan not found");
    }

    const entrance = new MapEditorEntrance({
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

    await entrance.save();

    const populated = await this.getEntranceWithRelations(entrance.id);
    if (!populated) {
      throw new Error("Failed to retrieve created entrance");
    }

    return this.serializeEntrance(populated as any);
  }

  async updateEntrance(
    id: string,
    data: UpdateMapEditorEntrancePayload,
    adminId: string,
  ): Promise<MapEditorEntranceOverview> {
    const entrance = await MapEditorEntrance.findById(id);
    if (!entrance) {
      throw new Error("Entrance not found");
    }

    if (data.name !== undefined) {
      entrance.name = data.name.trim();
    }

    if (data.category !== undefined) {
      entrance.category = data.category.trim();
    }

    if (data.description !== undefined) {
      entrance.description = data.description?.trim() || "";
    }

    if (data.coordinates !== undefined) {
      entrance.coordinates = {
        x: data.coordinates.x,
        y: data.coordinates.y,
      };
    }

    if (data.icon !== undefined) {
      entrance.icon = data.icon?.trim() || "";
    }

    if (data.color !== undefined) {
      entrance.color = data.color?.trim() || "";
    }

    if (data.isAccessible !== undefined) {
      entrance.isAccessible = data.isAccessible;
    }

    if (data.isActive !== undefined) {
      entrance.isActive = data.isActive;
    }

    entrance.updatedBy = toObjectId(adminId);

    await entrance.save();

    const populated = await this.getEntranceWithRelations(entrance.id);
    if (!populated) {
      throw new Error("Failed to retrieve updated entrance");
    }

    return this.serializeEntrance(populated as any);
  }

  async deleteEntrance(id: string): Promise<void> {
    const entrance = await MapEditorEntrance.findById(id);
    if (!entrance) {
      throw new Error("Entrance not found");
    }

    await MapEditorEntrance.findByIdAndDelete(id);
  }

  async deleteEntrancesByFloorPlan(floorPlanId: string): Promise<void> {
    const floorPlanObjectId = toObjectId(floorPlanId);
    if (!floorPlanObjectId) {
      throw new Error("Invalid floor plan ID");
    }

    await MapEditorEntrance.deleteMany({ floorPlan: floorPlanObjectId });
  }
}

const mapEditorEntranceService = new MapEditorEntranceService();

export { mapEditorEntranceService };
export default mapEditorEntranceService;

