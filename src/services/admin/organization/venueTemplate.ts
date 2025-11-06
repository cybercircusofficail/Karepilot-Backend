import VenueTemplate from "../../../models/admin/organization/venueTemplate";
import Organization from "../../../models/admin/organization/organization";
import { CreateVenueTemplateData, UpdateVenueTemplateData, VenueTemplateQuery } from "../../../types/admin/organization/venueTemplate";

export class VenueTemplateService {
  async getAllVenueTemplates(query: VenueTemplateQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const dbQuery: any = {};

    if (query.name) {
      dbQuery.name = { $regex: new RegExp(`^${query.name}$`, "i") };
    } else if (query.search) {
      dbQuery.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const venueTemplates = await VenueTemplate.find(dbQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VenueTemplate.countDocuments(dbQuery);

    return {
      venueTemplates,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  async getVenueTemplateById(id: string) {
    const venueTemplate = await VenueTemplate.findById(id);
    if (!venueTemplate) {
      throw new Error("Venue template not found");
    }
    return venueTemplate;
  }

  async createVenueTemplate(data: CreateVenueTemplateData) {
    const existingVenueTemplate = await VenueTemplate.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, "i") },
    });
    if (existingVenueTemplate) {
      throw new Error("Venue template with this name already exists");
    }

    const venueTemplate = new VenueTemplate({
      name: data.name,
      description: data.description,
      includedFeatures: data.includedFeatures || [],
      defaultPOICategories: data.defaultPOICategories || [],
    });

    await venueTemplate.save();

    return venueTemplate;
  }

  async updateVenueTemplate(id: string, data: UpdateVenueTemplateData) {
    const venueTemplate = await VenueTemplate.findById(id);
    if (!venueTemplate) {
      throw new Error("Venue template not found");
    }

    if (data.name && data.name.toLowerCase() !== venueTemplate.name.toLowerCase()) {
      const existingVenueTemplate = await VenueTemplate.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
        _id: { $ne: id },
      });
      if (existingVenueTemplate) {
        throw new Error("Venue template with this name already exists");
      }
    }

    const updatedVenueTemplate = await VenueTemplate.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return updatedVenueTemplate!;
  }

  async deleteVenueTemplate(id: string) {
    const venueTemplate = await VenueTemplate.findById(id);
    if (!venueTemplate) {
      throw new Error("Venue template not found");
    }

    const organizationsUsingTemplate = await Organization.countDocuments({
      venueTemplate: id,
    });

    if (organizationsUsingTemplate > 0) {
      throw new Error(
        `Cannot delete venue template. It is being used by ${organizationsUsingTemplate} organization(s)`
      );
    }

    await VenueTemplate.findByIdAndDelete(id);

    return venueTemplate;
  }
}

export default new VenueTemplateService();

