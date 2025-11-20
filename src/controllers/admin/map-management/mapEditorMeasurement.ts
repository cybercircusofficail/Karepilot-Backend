"use strict";

import { Request, Response } from "express";
import { mapEditorMeasurementService } from "../../../services/admin/map-management";
import {
  createMapEditorMeasurementSchema,
  updateMapEditorMeasurementSchema,
} from "../../../validations/admin/map-management/mapEditorMeasurement";

export const getMeasurementsByFloorPlan = async (req: Request, res: Response): Promise<void> => {
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
    };

    const measurements = await mapEditorMeasurementService.getMeasurementsByFloorPlan(query);

    res.status(200).json({
      success: true,
      message: "Measurements retrieved successfully",
      data: {
        measurements,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to retrieve measurements",
    });
  }
};

export const getMeasurementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Measurement ID is required",
      });
      return;
    }

    const measurement = await mapEditorMeasurementService.getMeasurementById(id);

    if (!measurement) {
      res.status(404).json({
        success: false,
        message: "Measurement not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Measurement retrieved successfully",
      data: {
        measurement,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "Measurement not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to retrieve measurement",
    });
  }
};

export const createMeasurement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = createMapEditorMeasurementSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0]?.message ?? "Failed to create measurement",
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

    const measurement = await mapEditorMeasurementService.createMeasurement(req.body, adminId);

    res.status(201).json({
      success: true,
      message: "Measurement created successfully",
      data: {
        measurement,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to create measurement",
    });
  }
};

export const updateMeasurement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Measurement ID is required",
      });
      return;
    }

    const { error } = updateMapEditorMeasurementSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0]?.message ?? "Failed to update measurement",
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

    const measurement = await mapEditorMeasurementService.updateMeasurement(id, req.body, adminId);

    res.status(200).json({
      success: true,
      message: "Measurement updated successfully",
      data: {
        measurement,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "Measurement not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to update measurement",
    });
  }
};

export const deleteMeasurement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Measurement ID is required",
      });
      return;
    }

    await mapEditorMeasurementService.deleteMeasurement(id);

    res.status(200).json({
      success: true,
      message: "Measurement deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.message === "Measurement not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to delete measurement",
    });
  }
};

