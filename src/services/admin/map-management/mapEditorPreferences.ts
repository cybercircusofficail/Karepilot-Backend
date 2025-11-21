"use strict";

import { Types } from "mongoose";
import { MapEditorPreferences } from "../../../models/admin/map-management";
import {
  MapEditorPreferencesResponse,
  UpdateMapEditorPreferencesPayload,
} from "../../../types/admin/map-management";
import { IMapEditorPreferences } from "../../../models/admin/map-management/mapEditorPreferences";

class MapEditorPreferencesService {
  private serializePreferences(doc: IMapEditorPreferences): MapEditorPreferencesResponse {
    const plain = doc.toObject({ virtuals: false });

    return {
      id: plain._id.toString(),
      userId: plain.userId.toString(),
      layerVisibility: plain.layerVisibility,
      properties: plain.properties,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }

  async getPreferences(userId: string): Promise<MapEditorPreferencesResponse> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    let preferences = await MapEditorPreferences.findOne({ userId: new Types.ObjectId(userId) });

    if (!preferences) {
      preferences = new MapEditorPreferences({
        userId: new Types.ObjectId(userId),
        layerVisibility: {
          floorPlan: true,
          pois: true,
          paths: true,
          zones: true,
          labels: true,
        },
        properties: {
          gridSize: 10,
          snapToGrid: true,
          showGrid: true,
        },
      });

      await preferences.save();
    }

    return this.serializePreferences(preferences);
  }

  async updatePreferences(
    userId: string,
    data: UpdateMapEditorPreferencesPayload
  ): Promise<MapEditorPreferencesResponse> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const userObjectId = new Types.ObjectId(userId);

    let preferences = await MapEditorPreferences.findOne({ userId: userObjectId });

    if (!preferences) {
      preferences = new MapEditorPreferences({
        userId: userObjectId,
        layerVisibility: {
          floorPlan: true,
          pois: true,
          paths: true,
          zones: true,
          labels: true,
          ...data.layerVisibility,
        },
        properties: {
          gridSize: 10,
          snapToGrid: true,
          showGrid: true,
          ...data.properties,
        },
      });
    } else {
      if (data.layerVisibility) {
        preferences.layerVisibility = {
          ...preferences.layerVisibility,
          ...data.layerVisibility,
        };
      }

      if (data.properties) {
        preferences.properties = {
          ...preferences.properties,
          ...data.properties,
        };
      }
    }

    await preferences.save();

    return this.serializePreferences(preferences);
  }

  async resetPreferences(userId: string): Promise<MapEditorPreferencesResponse> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const userObjectId = new Types.ObjectId(userId);

    const defaultPreferences = {
      userId: userObjectId,
      layerVisibility: {
        floorPlan: true,
        pois: true,
        paths: true,
        zones: true,
        labels: true,
      },
      properties: {
        gridSize: 10,
        snapToGrid: true,
        showGrid: true,
      },
    };

    const preferences = await MapEditorPreferences.findOneAndUpdate(
      { userId: userObjectId },
      defaultPreferences,
      { new: true, upsert: true, runValidators: true }
    );

    if (!preferences) {
      throw new Error("Failed to reset preferences");
    }

    return this.serializePreferences(preferences);
  }
}

export const mapEditorPreferencesService = new MapEditorPreferencesService();

