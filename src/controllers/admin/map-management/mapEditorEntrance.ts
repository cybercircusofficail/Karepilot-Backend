"use strict";

import { Request, Response } from "express";
import { mapEditorEntranceService } from "../../../services/admin/map-management";
import {
  createMapEditorEntranceSchema,
  updateMapEditorEntranceSchema,
} from "../../../validations/admin/map-management/mapEditorEntrance";

export const getEntrancesByFloorPlan = async (req: Request, res: Response): Promise<void> => {
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

    const entrances = await mapEditorEntranceService.getEntrancesByFloorPlan(query);

    res.status(200).json({
      success: true,
      message: "Entrances retrieved successfully",
      data: {
        entrances,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to retrieve entrances",
    });
  }
};

export const getEntranceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Entrance ID is required",
      });
      return;
    }

    const entrance = await mapEditorEntranceService.getEntranceById(id);

    if (!entrance) {
      res.status(404).json({
        success: false,
        message: "Entrance not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Entrance retrieved successfully",
      data: {
        entrance,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "Entrance not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to retrieve entrance",
    });
  }
};

export const createEntrance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createMapEditorEntranceSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0]?.message ?? "Validation failed",
      });
      return;
    }

    const adminId = (req as any).user?.id;
    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const entrance = await mapEditorEntranceService.createEntrance(value, adminId);

    res.status(201).json({
      success: true,
      message: "Entrance created successfully",
      data: {
        entrance,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to create entrance",
    });
  }
};

export const updateEntrance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Entrance ID is required",
      });
      return;
    }

    const { error, value } = updateMapEditorEntranceSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0]?.message ?? "Validation failed",
      });
      return;
    }

    const adminId = (req as any).user?.id;
    if (!adminId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const entrance = await mapEditorEntranceService.updateEntrance(id, value, adminId);

    res.status(200).json({
      success: true,
      message: "Entrance updated successfully",
      data: {
        entrance,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "Entrance not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to update entrance",
    });
  }
};

export const deleteEntrance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Entrance ID is required",
      });
      return;
    }

    await mapEditorEntranceService.deleteEntrance(id);

    res.status(200).json({
      success: true,
      message: "Entrance deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.message === "Entrance not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to delete entrance",
    });
  }
};

