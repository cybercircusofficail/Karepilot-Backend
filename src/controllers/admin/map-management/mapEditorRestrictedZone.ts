"use strict";

import { Request, Response } from "express";
import { mapEditorRestrictedZoneService } from "../../../services/admin/map-management";
import {
  createMapEditorRestrictedZoneSchema,
  updateMapEditorRestrictedZoneSchema,
} from "../../../validations/admin/map-management/mapEditorRestrictedZone";

export const getRestrictedZonesByFloorPlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
      isActive:
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
            ? false
            : undefined,
      search: req.query.search as string | undefined,
    };

    const restrictedZones = await mapEditorRestrictedZoneService.getRestrictedZonesByFloorPlan(
      query,
    );

    res.status(200).json({
      success: true,
      message: "Restricted zones retrieved successfully",
      data: {
        restrictedZones,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to retrieve restricted zones",
    });
  }
};

export const getRestrictedZoneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Restricted zone ID is required",
      });
      return;
    }

    const restrictedZone = await mapEditorRestrictedZoneService.getRestrictedZoneById(id);

    if (!restrictedZone) {
      res.status(404).json({
        success: false,
        message: "Restricted zone not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Restricted zone retrieved successfully",
      data: {
        restrictedZone,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "Restricted zone not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to retrieve restricted zone",
    });
  }
};

export const createRestrictedZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = createMapEditorRestrictedZoneSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0]?.message ?? "Failed to create restricted zone",
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

    const restrictedZone = await mapEditorRestrictedZoneService.createRestrictedZone(
      req.body,
      adminId,
    );

    res.status(201).json({
      success: true,
      message: "Restricted zone created successfully",
      data: {
        restrictedZone,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to create restricted zone",
    });
  }
};

export const updateRestrictedZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Restricted zone ID is required",
      });
      return;
    }

    const { error } = updateMapEditorRestrictedZoneSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0]?.message ?? "Failed to update restricted zone",
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

    const restrictedZone = await mapEditorRestrictedZoneService.updateRestrictedZone(
      id,
      req.body,
      adminId,
    );

    res.status(200).json({
      success: true,
      message: "Restricted zone updated successfully",
      data: {
        restrictedZone,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "Restricted zone not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to update restricted zone",
    });
  }
};

export const deleteRestrictedZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Restricted zone ID is required",
      });
      return;
    }

    await mapEditorRestrictedZoneService.deleteRestrictedZone(id);

    res.status(200).json({
      success: true,
      message: "Restricted zone deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.message === "Restricted zone not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to delete restricted zone",
    });
  }
};

