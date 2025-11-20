"use strict";

import { Types } from "mongoose";
import MapEditorElevator from "../../../models/admin/map-management/mapEditorElevator";
import {
  CreateMapEditorElevatorPayload,
  UpdateMapEditorElevatorPayload,
  MapEditorElevatorQuery,
  MapEditorElevatorOverview,
} from "../../../types/admin/map-management/mapEditorElevator";
import { IMapEditorElevator } from "../../../models/admin/map-management/mapEditorElevator";
import MapFloorPlan from "../../../models/admin/map-management/mapFloorPlan";

const toObjectId = (value?: string | null): Types.ObjectId | null => {
  if (!value || !Types.ObjectId.isValid(value)) {
    return null;
  }
  return new Types.ObjectId(value);
};

class MapEditorElevatorService {
  private serializeElevator(doc: IMapEditorElevator): MapEditorElevatorOverview {
    const result: MapEditorElevatorOverview = {
      id: (doc as any)._id.toString(),
      floorPlan: {
        id: doc.floorPlan.toString(),
        title: (doc.populated("floorPlan") as any)?.title || "",
        floorLabel: (doc.populated("floorPlan") as any)?.floorLabel || "",
      },
      name: doc.name,
      coordinates: {
        x: doc.coordinates.x,
        y: doc.coordinates.y,
      },
      connectsToFloors: doc.connectsToFloors,
      color: doc.color || "#7C3AED",
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

    return result;
  }

  private async getElevatorWithRelations(id: string): Promise<IMapEditorElevator | null> {
    return MapEditorElevator.findById(id).populate("floorPlan", "title floorLabel");
  }

  async getElevatorsByFloorPlan(
    query: MapEditorElevatorQuery,
  ): Promise<MapEditorElevatorOverview[]> {
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
      dbQuery.$or = [{ name: { $regex: searchRegex } }, { description: { $regex: searchRegex } }];
    }

    const elevators = await MapEditorElevator.find(dbQuery)
      .populate("floorPlan", "title floorLabel")
      .sort({ createdAt: -1 })
      .lean();

    return elevators.map((doc: any): MapEditorElevatorOverview => {
      const result: MapEditorElevatorOverview = {
        id: doc._id.toString(),
        floorPlan: {
          id: doc.floorPlan._id.toString(),
          title: doc.floorPlan.title || "",
          floorLabel: doc.floorPlan.floorLabel || "",
        },
        name: doc.name,
        coordinates: {
          x: doc.coordinates.x,
          y: doc.coordinates.y,
        },
        connectsToFloors: doc.connectsToFloors,
        color: doc.color || "#7C3AED",
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

      return result;
    });
  }

  async getElevatorById(id: string): Promise<MapEditorElevatorOverview | null> {
    const elevator = await this.getElevatorWithRelations(id);
    if (!elevator) {
      return null;
    }
    return this.serializeElevator(elevator as any);
  }

  async createElevator(
    data: CreateMapEditorElevatorPayload,
    adminId: string,
  ): Promise<MapEditorElevatorOverview> {
    const floorPlanId = toObjectId(data.floorPlanId);
    if (!floorPlanId) {
      throw new Error("Invalid floor plan ID");
    }

    const floorPlan = await MapFloorPlan.findById(floorPlanId);
    if (!floorPlan) {
      throw new Error("Floor plan not found");
    }

    if (!data.connectsToFloors || data.connectsToFloors.length === 0) {
      throw new Error("At least one floor connection is required");
    }

    const elevator = new MapEditorElevator({
      floorPlan: floorPlanId,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      coordinates: {
        x: data.coordinates.x,
        y: data.coordinates.y,
      },
      connectsToFloors: data.connectsToFloors,
      icon: data.icon?.trim() || undefined,
      color: data.color?.trim() || "#7C3AED",
      isAccessible: data.isAccessible ?? true,
      isActive: true,
      createdBy: toObjectId(adminId),
      updatedBy: toObjectId(adminId),
    });

    await elevator.save();

    const populated = await this.getElevatorWithRelations(elevator.id);
    if (!populated) {
      throw new Error("Failed to retrieve created elevator");
    }

    return this.serializeElevator(populated as any);
  }

  async updateElevator(
    id: string,
    data: UpdateMapEditorElevatorPayload,
    adminId: string,
  ): Promise<MapEditorElevatorOverview> {
    const elevator = await MapEditorElevator.findById(id);
    if (!elevator) {
      throw new Error("Elevator not found");
    }

    if (data.name !== undefined) {
      elevator.name = data.name.trim();
    }

    if (data.description !== undefined) {
      elevator.description = data.description?.trim() || "";
    }

    if (data.coordinates !== undefined) {
      elevator.coordinates = {
        x: data.coordinates.x,
        y: data.coordinates.y,
      };
    }

    if (data.connectsToFloors !== undefined) {
      if (data.connectsToFloors.length === 0) {
        throw new Error("At least one floor connection is required");
      }
      elevator.connectsToFloors = data.connectsToFloors;
    }

    if (data.icon !== undefined) {
      elevator.icon = data.icon?.trim() || "";
    }

    if (data.color !== undefined) {
      elevator.color = data.color?.trim() || "#7C3AED";
    }

    if (data.isAccessible !== undefined) {
      elevator.isAccessible = data.isAccessible;
    }

    if (data.isActive !== undefined) {
      elevator.isActive = data.isActive;
    }

    elevator.updatedBy = toObjectId(adminId);

    await elevator.save();

    const populated = await this.getElevatorWithRelations(elevator.id);
    if (!populated) {
      throw new Error("Failed to retrieve updated elevator");
    }

    return this.serializeElevator(populated as any);
  }

  async deleteElevator(id: string): Promise<void> {
    const elevator = await MapEditorElevator.findById(id);
    if (!elevator) {
      throw new Error("Elevator not found");
    }

    await MapEditorElevator.findByIdAndDelete(id);
  }

  async deleteElevatorsByFloorPlan(floorPlanId: string): Promise<void> {
    const floorPlanObjectId = toObjectId(floorPlanId);
    if (!floorPlanObjectId) {
      throw new Error("Invalid floor plan ID");
    }

    await MapEditorElevator.deleteMany({ floorPlan: floorPlanObjectId });
  }
}

const mapEditorElevatorService = new MapEditorElevatorService();

export { mapEditorElevatorService };
export default mapEditorElevatorService;
