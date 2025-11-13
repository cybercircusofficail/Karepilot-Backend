import { Request, Response } from "express";
import httpStatus from "http-status";
import { mapManagerFloorPlanService } from "../../../services/admin/map-manager";
import { FloorPlanQuery } from "../../../types/admin/map-manager";
import { FloorPlanStatus } from "../../../models/admin/map-manager/enums";

export const getFloorPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: FloorPlanQuery = {};

    if (req.query.page) {
      query.page = parseInt(req.query.page as string, 10);
    }

    if (req.query.limit) {
      query.limit = parseInt(req.query.limit as string, 10);
    }

    if (req.query.organization) {
      query.organization = req.query.organization as string;
    }

    if (req.query.building) {
      query.building = req.query.building as string;
    }

    if (req.query.floor) {
      query.floor = req.query.floor as string;
    }

    if (req.query.status) {
      query.status = req.query.status as FloorPlanStatus;
    }

    if (req.query.search) {
      query.search = req.query.search as string;
    }

    if (req.query.tag) {
      query.tag = req.query.tag as string;
    }

    const { floorPlans, pagination } = await mapManagerFloorPlanService.getFloorPlans(query);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Floor plans retrieved successfully",
      data: {
        floorPlans,
        pagination,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to retrieve floor plans",
    });
  }
};

export const getFloorPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const floorPlan = await mapManagerFloorPlanService.getFloorPlanById(id);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Floor plan retrieved successfully",
      data: { floorPlan },
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.NOT_FOUND).json({
      success: false,
      message: error.message || "Floor plan not found",
    });
  }
};

export const createFloorPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const floorPlan = await mapManagerFloorPlanService.createFloorPlan(req.body, userId);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Floor plan created successfully",
      data: { floorPlan },
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message || "Failed to create floor plan",
    });
  }
};

export const updateFloorPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const { id } = req.params as { id: string };
    const floorPlan = await mapManagerFloorPlanService.updateFloorPlan(
      id,
      req.body,
      userId,
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Floor plan updated successfully",
      data: { floorPlan },
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message || "Failed to update floor plan",
    });
  }
};

export const deleteFloorPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const { id } = req.params as { id: string };
    await mapManagerFloorPlanService.deleteFloorPlan(id, userId);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Floor plan archived successfully",
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message || "Failed to archive floor plan",
    });
  }
};

export const getFloorPlanStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const statsQuery: FloorPlanQuery = {};

    if (req.query.organization) {
      statsQuery.organization = req.query.organization as string;
    }

    if (req.query.building) {
      statsQuery.building = req.query.building as string;
    }

    if (req.query.floor) {
      statsQuery.floor = req.query.floor as string;
    }

    const stats = await mapManagerFloorPlanService.getFloorPlanStats(statsQuery);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Floor plan stats retrieved successfully",
      data: stats,
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to retrieve floor plan stats",
    });
  }
};


