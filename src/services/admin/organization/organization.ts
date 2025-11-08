import Organization, {
  OrganizationType,
} from "../../../models/admin/organization/organization";
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

    const organization = await Organization.create({
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
      createdBy,
      updatedBy: createdBy,
    });

    return await Organization.findById(organization._id)
      .populate("venueTemplate", "name description")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");
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

  async deleteOrganizationPermanently(id: string) {
    const organization = await Organization.findById(id);
    if (!organization) {
      throw new Error("Organization not found");
    }

    await Organization.findByIdAndDelete(id);
  }

  private computeChange(current: number, previous: number): number {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  async getOrganizationsOverview() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalCount,
      activeCount,
      hospitalCount,
      totalCreatedCurrent,
      totalCreatedPrevious,
      activeCreatedCurrent,
      activeCreatedPrevious,
      hospitalCreatedCurrent,
      hospitalCreatedPrevious,
      distribution,
    ] = await Promise.all([
      Organization.countDocuments({}),
      Organization.countDocuments({ isActive: true }),
      Organization.countDocuments({ organizationType: "Hospital" }),
      Organization.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Organization.countDocuments({
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
      Organization.countDocuments({
        isActive: true,
        createdAt: { $gte: sevenDaysAgo },
      }),
      Organization.countDocuments({
        isActive: true,
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
      Organization.countDocuments({
        organizationType: "Hospital",
        createdAt: { $gte: sevenDaysAgo },
      }),
      Organization.countDocuments({
        organizationType: "Hospital",
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
      Organization.find({})
        .populate("venueTemplate", "name")
        .select("organizationType venueTemplate"),
    ]);

    const otherCount = Math.max(0, totalCount - hospitalCount);
    const otherCreatedCurrent = Math.max(
      0,
      totalCreatedCurrent - hospitalCreatedCurrent,
    );
    const otherCreatedPrevious = Math.max(
      0,
      totalCreatedPrevious - hospitalCreatedPrevious,
    );

    const summary = {
      total: {
        count: totalCount,
        change: this.computeChange(totalCreatedCurrent, totalCreatedPrevious),
      },
      active: {
        count: activeCount,
        change: this.computeChange(
          activeCreatedCurrent,
          activeCreatedPrevious,
        ),
      },
      hospitals: {
        count: hospitalCount,
        change: this.computeChange(
          hospitalCreatedCurrent,
          hospitalCreatedPrevious,
        ),
      },
      otherVenues: {
        count: otherCount,
        change: this.computeChange(
          otherCreatedCurrent,
          otherCreatedPrevious,
        ),
      },
    };

    const distributionMap: Record<
      "Hospital" | "Airport" | "Shopping Mall" | "Open Place",
      number
    > = {
      Hospital: 0,
      Airport: 0,
      "Shopping Mall": 0,
      "Open Place": 0,
    };

    for (const organization of distribution) {
      const orgType = organization.organizationType;
      const templateName = (
        (organization.venueTemplate as any)?.name ?? ""
      ).toString();
      let normalizedType: keyof typeof distributionMap | null = null;

      switch (orgType) {
        case OrganizationType.HOSPITAL:
          normalizedType = "Hospital";
          break;
        case OrganizationType.AIRPORT:
          normalizedType = "Airport";
          break;
        case OrganizationType.SHOPPING_MALL:
          normalizedType = "Shopping Mall";
          break;
        case OrganizationType.OPEN_PLACE:
          normalizedType = "Open Place";
          break;
        default:
          if (/airport/i.test(templateName)) {
            normalizedType = "Airport";
          } else if (/shopping/i.test(templateName) || /mall/i.test(templateName)) {
            normalizedType = "Shopping Mall";
          } else if (/open/i.test(templateName) || /campus/i.test(templateName)) {
            normalizedType = "Open Place";
          } else if (/hospital/i.test(templateName) || /clinic/i.test(templateName)) {
            normalizedType = "Hospital";
          }
          break;
      }

      if (normalizedType) {
        distributionMap[normalizedType] += 1;
      }
    }

    const distributionResult = (Object.keys(
      distributionMap,
    ) as Array<keyof typeof distributionMap>).map((key) => ({
      organizationType: key,
      count: distributionMap[key],
    }));

    const recentOrganizations = await Organization.find({})
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({ updatedAt: -1 })
      .limit(4);

    const recentActivity = recentOrganizations.map((organization) => {
      const createdAt = organization.createdAt;
      const updatedAt = organization.updatedAt;
      let activityType: "created" | "updated" | "deactivated" = "created";

      if (!organization.isActive) {
        activityType = "deactivated";
      } else if (
        updatedAt &&
        createdAt &&
        updatedAt.getTime() - createdAt.getTime() > 60 * 1000
      ) {
        activityType = "updated";
      }

      const actor =
        activityType === "created"
          ? organization.createdBy
          : organization.updatedBy || organization.createdBy;

      return {
        id: organization._id,
        name: organization.name,
        organizationType: organization.organizationType,
        isActive: organization.isActive,
        activityType,
        createdAt,
        updatedAt,
        actor: actor
          ? {
              id:
                (actor as any)?.id ||
                (actor as any)?._id?.toString?.() ||
                undefined,
              firstName: (actor as any)?.firstName ?? "",
              lastName: (actor as any)?.lastName ?? "",
              email: (actor as any)?.email ?? "",
            }
          : null,
      };
    });

    return {
      summary,
      distribution: distributionResult,
      recentActivity,
    };
  }
}

export default new OrganizationService();

