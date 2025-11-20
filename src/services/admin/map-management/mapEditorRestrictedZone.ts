"use strict";

import { Types } from "mongoose";
import MapEditorRestrictedZone from "../../../models/admin/map-management/mapEditorRestrictedZone";
import {
  CreateMapEditorRestrictedZonePayload,
  UpdateMapEditorRestrictedZonePayload,
  MapEditorRestrictedZoneQuery,
  MapEditorRestrictedZoneOverview,
  RestrictionType,
} from "../../../types/admin/map-management/mapEditorRestrictedZone";
import { IMapEditorRestrictedZone } from "../../../models/admin/map-management/mapEditorRestrictedZone";
import MapFloorPlan from "../../../models/admin/map-management/mapFloorPlan";

const toObjectId = (value?: string | null): Types.ObjectId | null => {
  if (!value || !Types.ObjectId.isValid(value)) {
    return null;
  }
  return new Types.ObjectId(value);
};

class MapEditorRestrictedZoneService {
  private serializeRestrictedZone(
    doc: IMapEditorRestrictedZone,
  ): MapEditorRestrictedZoneOverview {
    const result: MapEditorRestrictedZoneOverview = {
      id: (doc as any)._id.toString(),
      floorPlan: {
        id: doc.floorPlan.toString(),
        title: (doc.populated("floorPlan") as any)?.title || "",
        floorLabel: (doc.populated("floorPlan") as any)?.floorLabel || "",
      },
      name: doc.name,
      restrictionType: doc.restrictionType,
      coordinates: {
        x: doc.coordinates.x,
        y: doc.coordinates.y,
        width: doc.coordinates.width,
        height: doc.coordinates.height,
      },
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    if (doc.description) {
      result.description = doc.description;
    }
    if (doc.color) {
      result.color = doc.color;
    }

    return result;
  }

  private async getRestrictedZoneWithRelations(
    id: string,
  ): Promise<IMapEditorRestrictedZone | null> {
    return MapEditorRestrictedZone.findById(id).populate("floorPlan", "title floorLabel");
  }

  async getRestrictedZonesByFloorPlan(
    query: MapEditorRestrictedZoneQuery,
  ): Promise<MapEditorRestrictedZoneOverview[]> {
    const floorPlanId = toObjectId(query.floorPlanId);
    if (!floorPlanId) {
      throw new Error("Invalid floor plan ID");
    }

    const dbQuery: Record<string, unknown> = {
      floorPlan: floorPlanId,
      isActive: typeof query.isActive === "boolean" ? query.isActive : true,
    };

    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      dbQuery.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    const restrictedZones = await MapEditorRestrictedZone.find(dbQuery)
      .populate("floorPlan", "title floorLabel")
      .sort({ createdAt: -1 })
      .lean();

    return restrictedZones.map((doc: any): MapEditorRestrictedZoneOverview => {
      const result: MapEditorRestrictedZoneOverview = {
        id: doc._id.toString(),
        floorPlan: {
          id: doc.floorPlan._id.toString(),
          title: doc.floorPlan.title || "",
          floorLabel: doc.floorPlan.floorLabel || "",
        },
        name: doc.name,
        restrictionType: doc.restrictionType,
        coordinates: {
          x: doc.coordinates.x,
          y: doc.coordinates.y,
          width: doc.coordinates.width,
          height: doc.coordinates.height,
        },
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };

      if (doc.description) {
        result.description = doc.description;
      }
      if (doc.color) {
        result.color = doc.color;
      }

      return result;
    });
  }

  async getRestrictedZoneById(
    id: string,
  ): Promise<MapEditorRestrictedZoneOverview | null> {
    const restrictedZone = await this.getRestrictedZoneWithRelations(id);
    if (!restrictedZone) {
      return null;
    }
    return this.serializeRestrictedZone(restrictedZone as any);
  }

  async createRestrictedZone(
    data: CreateMapEditorRestrictedZonePayload,
    adminId: string,
  ): Promise<MapEditorRestrictedZoneOverview> {
    const floorPlanId = toObjectId(data.floorPlanId);
    if (!floorPlanId) {
      throw new Error("Invalid floor plan ID");
    }

    const floorPlan = await MapFloorPlan.findById(floorPlanId);
    if (!floorPlan) {
      throw new Error("Floor plan not found");
    }

    const restrictedZone = new MapEditorRestrictedZone({
      floorPlan: floorPlanId,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      restrictionType: data.restrictionType,
      coordinates: {
        x: data.coordinates.x,
        y: data.coordinates.y,
        width: data.coordinates.width,
        height: data.coordinates.height,
      },
      color: data.color?.trim() || "#EF4444",
      isActive: true,
      createdBy: toObjectId(adminId),
      updatedBy: toObjectId(adminId),
    });

    await restrictedZone.save();

    const populated = await this.getRestrictedZoneWithRelations(restrictedZone.id);
    if (!populated) {
      throw new Error("Failed to retrieve created restricted zone");
    }

    return this.serializeRestrictedZone(populated as any);
  }

  async updateRestrictedZone(
    id: string,
    data: UpdateMapEditorRestrictedZonePayload,
    adminId: string,
  ): Promise<MapEditorRestrictedZoneOverview> {
    const restrictedZone = await MapEditorRestrictedZone.findById(id);
    if (!restrictedZone) {
      throw new Error("Restricted zone not found");
    }

    if (data.name !== undefined) {
      restrictedZone.name = data.name.trim();
    }

    if (data.description !== undefined) {
      restrictedZone.description = data.description?.trim() || "";
    }

    if (data.restrictionType !== undefined) {
      restrictedZone.restrictionType = data.restrictionType;
    }

    if (data.coordinates !== undefined) {
      restrictedZone.coordinates = {
        x: data.coordinates.x,
        y: data.coordinates.y,
        width: data.coordinates.width,
        height: data.coordinates.height,
      };
    }

    if (data.color !== undefined) {
      restrictedZone.color = data.color?.trim() || "#EF4444";
    }

    if (data.isActive !== undefined) {
      restrictedZone.isActive = data.isActive;
    }

    restrictedZone.updatedBy = toObjectId(adminId);

    await restrictedZone.save();

    const populated = await this.getRestrictedZoneWithRelations(restrictedZone.id);
    if (!populated) {
      throw new Error("Failed to retrieve updated restricted zone");
    }

    return this.serializeRestrictedZone(populated as any);
  }

  async deleteRestrictedZone(id: string): Promise<void> {
    const restrictedZone = await MapEditorRestrictedZone.findById(id);
    if (!restrictedZone) {
      throw new Error("Restricted zone not found");
    }

    await MapEditorRestrictedZone.findByIdAndDelete(id);
  }

  async deleteRestrictedZonesByFloorPlan(floorPlanId: string): Promise<void> {
    const floorPlanObjectId = toObjectId(floorPlanId);
    if (!floorPlanObjectId) {
      throw new Error("Invalid floor plan ID");
    }

    await MapEditorRestrictedZone.deleteMany({ floorPlan: floorPlanObjectId });
  }
}

const mapEditorRestrictedZoneService = new MapEditorRestrictedZoneService();

export { mapEditorRestrictedZoneService };
export default mapEditorRestrictedZoneService;

