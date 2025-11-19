"use strict";

import { Request, Response } from "express";
import { mapEditorPOIService } from "../../../services/admin/map-management";
import {
  createMapEditorPOISchema,
  updateMapEditorPOISchema,
} from "../../../validations/admin/map-management/mapEditorPOI";

export const getPOIsByFloorPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { floorPlanId } = req.query;

    if (!floorPlanId || typeof floorPlanId !== "string") {
      res.status(400).json({
        success: false,
        message: "Floor plan ID is required",
      });
      return;
    }

    const query = {
      floorPlanId,
      category: req.query.category as string | undefined,
      isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
      search: req.query.search as string | undefined,
    };

    const pois = await mapEditorPOIService.getPOIsByFloorPlan(query);

    res.status(200).json({
      success: true,
      message: "POIs retrieved successfully",
      data: {
        pois,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to retrieve POIs",
    });
  }
};

export const getPOIById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "POI ID is required",
      });
      return;
    }

    const poi = await mapEditorPOIService.getPOIById(id);

    if (!poi) {
      res.status(404).json({
        success: false,
        message: "POI not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "POI retrieved successfully",
      data: {
        poi,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "POI not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to retrieve POI",
    });
  }
};

export const createPOI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = createMapEditorPOISchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0]?.message ?? "Failed to create POI",
      });
      return;
    }

    const adminId = (req.user as any)?._id?.toString();
    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Admin user not found.",
      });
      return;
    }

    const poi = await mapEditorPOIService.createPOI(req.body, adminId);

    res.status(201).json({
      success: true,
      message: "POI created successfully",
      data: {
        poi,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to create POI",
    });
  }
};

export const updatePOI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "POI ID is required",
      });
      return;
    }

    const { error } = updateMapEditorPOISchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0]?.message ?? "Failed to update POI",
      });
      return;
    }

    const adminId = (req.user as any)?._id?.toString();
    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Admin user not found.",
      });
      return;
    }

    const poi = await mapEditorPOIService.updatePOI(id, req.body, adminId);

    res.status(200).json({
      success: true,
      message: "POI updated successfully",
      data: {
        poi,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "POI not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to update POI",
    });
  }
};

export const deletePOI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "POI ID is required",
      });
      return;
    }

    await mapEditorPOIService.deletePOI(id);

    res.status(200).json({
      success: true,
      message: "POI deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.message === "POI not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to delete POI",
    });
  }
};

