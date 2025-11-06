import { Request, Response } from "express";
import { organizationService } from "../../../services/admin/organization";

export const getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.page) query.page = parseInt(req.query.page as string);
    if (req.query.limit) query.limit = parseInt(req.query.limit as string);
    if (req.query.search) query.search = req.query.search as string;
    if (req.query.name) query.name = req.query.name as string;
    if (req.query.organizationType) query.organizationType = req.query.organizationType as string;
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true' || req.query.isActive === true;
    } else {
      query.isActive = true;
    }

    const result = await organizationService.getAllOrganizations(query);

    res.status(200).json({
      success: true,
      message: "Organizations retrieved successfully",
      data: {
        organizations: result.organizations.map((organization) => ({
          id: organization._id,
          organizationType: organization.organizationType,
          name: organization.name,
          email: organization.email,
          phone: organization.phone,
          country: organization.country,
          city: organization.city,
          timezone: organization.timezone,
          address: organization.address,
          venueTemplate: organization.venueTemplate,
          isActive: organization.isActive,
          createdBy: organization.createdBy,
          updatedBy: organization.updatedBy,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
        })),
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving organizations",
    });
  }
};

export const getOrganizationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organization = await organizationService.getOrganizationById(id as string);

    res.status(200).json({
      success: true,
      message: "Organization retrieved successfully",
      data: {
        organization: {
          id: organization._id,
          organizationType: organization.organizationType,
          name: organization.name,
          email: organization.email,
          phone: organization.phone,
          country: organization.country,
          city: organization.city,
          timezone: organization.timezone,
          address: organization.address,
          venueTemplate: organization.venueTemplate,
          isActive: organization.isActive,
          createdBy: organization.createdBy,
          updatedBy: organization.updatedBy,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
        },
      },
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Organization not found",
    });
  }
};

export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const createdBy = (req.user as any)?._id?.toString();
    if (!createdBy) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Admin user not found.",
      });
      return;
    }

    const result = await organizationService.createOrganization(req.body, createdBy);

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: {
        organization: {
          id: result._id,
          organizationType: result.organizationType,
          name: result.name,
          email: result.email,
          phone: result.phone,
          country: result.country,
          city: result.city,
          timezone: result.timezone,
          address: result.address,
          venueTemplate: result.venueTemplate,
          isActive: result.isActive,
          createdBy: result.createdBy,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating organization",
    });
  }
};

export const updateOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBy = (req.user as any)?._id?.toString();
    
    if (!updatedBy) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Admin user not found.",
      });
      return;
    }

    const organization = await organizationService.updateOrganization(id as string, updateData, updatedBy);

    res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: {
        organization: {
          id: organization._id,
          organizationType: organization.organizationType,
          name: organization.name,
          email: organization.email,
          phone: organization.phone,
          country: organization.country,
          city: organization.city,
          timezone: organization.timezone,
          address: organization.address,
          venueTemplate: organization.venueTemplate,
          isActive: organization.isActive,
          createdBy: organization.createdBy,
          updatedBy: organization.updatedBy,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating organization",
    });
  }
};

export const deleteOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedBy = (req.user as any)?._id?.toString();

    if (!updatedBy) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Admin user not found.",
      });
      return;
    }

    await organizationService.deleteOrganization(id as string, updatedBy);

    res.status(200).json({
      success: true,
      message: "Organization deactivated successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error deactivating organization",
    });
  }
};

