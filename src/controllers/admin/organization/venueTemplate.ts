import { Request, Response } from "express";
import { venueTemplateService } from "../../../services/admin/organization";

export const getAllVenueTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.page) query.page = parseInt(req.query.page as string);
    if (req.query.limit) query.limit = parseInt(req.query.limit as string);
    if (req.query.search) query.search = req.query.search as string;
    if (req.query.name) query.name = req.query.name as string;

    const result = await venueTemplateService.getAllVenueTemplates(query);

    res.status(200).json({
      success: true,
      message: "Venue templates retrieved successfully",
      data: {
        venueTemplates: result.venueTemplates.map((venueTemplate) => ({
          id: venueTemplate._id,
          name: venueTemplate.name,
          description: venueTemplate.description,
          includedFeatures: venueTemplate.includedFeatures,
          defaultPOICategories: venueTemplate.defaultPOICategories,
          createdAt: venueTemplate.createdAt,
          updatedAt: venueTemplate.updatedAt,
        })),
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving venue templates",
    });
  }
};

export const getVenueTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const venueTemplate = await venueTemplateService.getVenueTemplateById(id as string);

    res.status(200).json({
      success: true,
      message: "Venue template retrieved successfully",
      data: {
        venueTemplate: {
          id: venueTemplate._id,
          name: venueTemplate.name,
          description: venueTemplate.description,
          includedFeatures: venueTemplate.includedFeatures,
          defaultPOICategories: venueTemplate.defaultPOICategories,
          createdAt: venueTemplate.createdAt,
          updatedAt: venueTemplate.updatedAt,
        },
      },
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Venue template not found",
    });
  }
};

export const createVenueTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await venueTemplateService.createVenueTemplate(req.body);

    res.status(201).json({
      success: true,
      message: "Venue template created successfully",
      data: {
        venueTemplate: {
          id: result._id,
          name: result.name,
          description: result.description,
          includedFeatures: result.includedFeatures,
          defaultPOICategories: result.defaultPOICategories,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating venue template",
    });
  }
};

export const updateVenueTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const venueTemplate = await venueTemplateService.updateVenueTemplate(id as string, updateData);

    res.status(200).json({
      success: true,
      message: "Venue template updated successfully",
      data: {
        venueTemplate: {
          id: venueTemplate._id,
          name: venueTemplate.name,
          description: venueTemplate.description,
          includedFeatures: venueTemplate.includedFeatures,
          defaultPOICategories: venueTemplate.defaultPOICategories,
          createdAt: venueTemplate.createdAt,
          updatedAt: venueTemplate.updatedAt,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating venue template",
    });
  }
};

export const deleteVenueTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await venueTemplateService.deleteVenueTemplate(id as string);

    res.status(200).json({
      success: true,
      message: "Venue template deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error deleting venue template",
    });
  }
};

