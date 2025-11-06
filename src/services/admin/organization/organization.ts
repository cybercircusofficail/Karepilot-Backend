import Organization from "../../../models/admin/organization/organization";
import VenueTemplate from "../../../models/admin/organization/venueTemplate";
import { CreateOrganizationData, UpdateOrganizationData, OrganizationQuery } from "../../../types/admin/organization/organization";

export class OrganizationService {
  async getAllOrganizations(query: OrganizationQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const dbQuery: any = {};

    if (query.name) {
      dbQuery.name = { $regex: new RegExp(`^${query.name}$`, "i") };
    } else if (query.search) {
      dbQuery.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { city: { $regex: query.search, $options: "i" } },
        { country: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.organizationType) {
      dbQuery.organizationType = query.organizationType;
    }

    if (query.isActive !== undefined) {
      dbQuery.isActive = query.isActive;
    } else {
      dbQuery.isActive = true;
    }

    const skip = (page - 1) * limit;

    const organizations = await Organization.find(dbQuery)
      .populate("venueTemplate", "name description")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Organization.countDocuments(dbQuery);

    return {
      organizations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async getOrganizationById(id: string) {
    const organization = await Organization.findById(id)
      .populate("venueTemplate", "name description includedFeatures defaultPOICategories")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");
    
    if (!organization) {
      throw new Error("Organization not found");
    }
    return organization;
  }

  async createOrganization(data: CreateOrganizationData, createdBy: string) {
    const existingOrganization = await Organization.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, "i") },
    });
    if (existingOrganization) {
      throw new Error("Organization with this name already exists");
    }

    const existingEmail = await Organization.findOne({
      email: data.email.toLowerCase(),
    });
    if (existingEmail) {
      throw new Error("Organization with this email already exists");
    }

    const venueTemplate = await VenueTemplate.findById(data.venueTemplate);
    if (!venueTemplate) {
      throw new Error("Venue template not found");
    }

    const organization = new Organization({
      organizationType: data.organizationType,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      country: data.country,
      city: data.city,
      timezone: data.timezone,
      address: data.address,
      venueTemplate: data.venueTemplate,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdBy: createdBy,
    });

    await organization.save();

    return await Organization.findById(organization._id)
      .populate("venueTemplate", "name description")
      .populate("createdBy", "firstName lastName email");
  }

  async updateOrganization(id: string, data: UpdateOrganizationData, updatedBy: string) {
    const organization = await Organization.findById(id);
    if (!organization) {
      throw new Error("Organization not found");
    }

    if (data.name && data.name.toLowerCase() !== organization.name.toLowerCase()) {
      const existingOrganization = await Organization.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
        _id: { $ne: id },
      });
      if (existingOrganization) {
        throw new Error("Organization with this name already exists");
      }
    }

    if (data.email && data.email.toLowerCase() !== organization.email.toLowerCase()) {
      const existingEmail = await Organization.findOne({
        email: data.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingEmail) {
        throw new Error("Organization with this email already exists");
      }
    }

    if (data.venueTemplate) {
      const venueTemplate = await VenueTemplate.findById(data.venueTemplate);
      if (!venueTemplate) {
        throw new Error("Venue template not found");
      }
    }

    const updateData: any = { ...data };
    if (data.email) {
      updateData.email = data.email.toLowerCase();
    }
    updateData.updatedBy = updatedBy;

    const updatedOrganization = await Organization.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("venueTemplate", "name description")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    return updatedOrganization!;
  }

  async deleteOrganization(id: string, updatedBy: string) {
    const organization = await Organization.findById(id);
    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!organization.isActive) {
      throw new Error("Organization is already inactive");
    }

    organization.isActive = false;
    organization.updatedBy = updatedBy as any;
    await organization.save();

    return await Organization.findById(id)
      .populate("venueTemplate", "name description")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");
  }
}

export default new OrganizationService();

