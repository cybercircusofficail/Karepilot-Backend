"use strict";

import { Request, Response } from "express";
import { mapEditorElevatorService } from "../../../services/admin/map-management";
import {
  createMapEditorElevatorSchema,
  updateMapEditorElevatorSchema,
} from "../../../validations/admin/map-management/mapEditorElevator";

export const getElevatorsByFloorPlan = async (req: Request, res: Response): Promise<void> => {
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
        req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
      search: req.query.search as string | undefined,
    };

    const elevators = await mapEditorElevatorService.getElevatorsByFloorPlan(query);

    res.status(200).json({
      success: true,
      message: "Elevators retrieved successfully",
      data: {
        elevators,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to retrieve elevators",
    });
  }
};

export const getElevatorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Elevator ID is required",
      });
      return;
    }

    const elevator = await mapEditorElevatorService.getElevatorById(id);

    if (!elevator) {
      res.status(404).json({
        success: false,
        message: "Elevator not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Elevator retrieved successfully",
      data: {
        elevator,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "Elevator not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to retrieve elevator",
    });
  }
};

export const createElevator = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createMapEditorElevatorSchema.validate(req.body);

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

    const elevator = await mapEditorElevatorService.createElevator(value, adminId);

    res.status(201).json({
      success: true,
      message: "Elevator created successfully",
      data: {
        elevator,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to create elevator",
    });
  }
};

export const updateElevator = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Elevator ID is required",
      });
      return;
    }

    const { error, value } = updateMapEditorElevatorSchema.validate(req.body);

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

    const elevator = await mapEditorElevatorService.updateElevator(id, value, adminId);

    res.status(200).json({
      success: true,
      message: "Elevator updated successfully",
      data: {
        elevator,
      },
    });
  } catch (error: any) {
    const statusCode = error.message === "Elevator not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to update elevator",
    });
  }
};

export const deleteElevator = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Elevator ID is required",
      });
      return;
    }

    await mapEditorElevatorService.deleteElevator(id);

    res.status(200).json({
      success: true,
      message: "Elevator deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.message === "Elevator not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to delete elevator",
    });
  }
};
