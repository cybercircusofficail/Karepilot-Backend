import { Request, Response } from "express";
import { mapEditorPreferencesService } from "../../../services/admin/map-management";

export class MapEditorPreferencesController {
  async getPreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - User not authenticated",
        });
      }

      const preferences = await mapEditorPreferencesService.getPreferences(userId);

      return res.status(200).json({
        success: true,
        message: "Preferences retrieved successfully",
        data: preferences,
      });
    } catch (error: any) {
      console.error("Error getting map editor preferences:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get preferences",
      });
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - User not authenticated",
        });
      }

      const { layerVisibility, properties } = req.body;

      const preferences = await mapEditorPreferencesService.updatePreferences(userId, {
        layerVisibility,
        properties,
      });

      return res.status(200).json({
        success: true,
        message: "Preferences updated successfully",
        data: preferences,
      });
    } catch (error: any) {
      console.error("Error updating map editor preferences:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update preferences",
      });
    }
  }

  async resetPreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - User not authenticated",
        });
      }

      const preferences = await mapEditorPreferencesService.resetPreferences(userId);

      return res.status(200).json({
        success: true,
        message: "Preferences reset to defaults successfully",
        data: preferences,
      });
    } catch (error: any) {
      console.error("Error resetting map editor preferences:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to reset preferences",
      });
    }
  }
}

export default new MapEditorPreferencesController();

