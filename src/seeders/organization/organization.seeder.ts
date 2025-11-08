import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import Organization, {
  OrganizationType,
} from "../../models/admin/organization/organization";
import VenueTemplate from "../../models/admin/organization/venueTemplate";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";
import { SeedOrganizationPayload } from "../../types";

const organizationsToSeed: SeedOrganizationPayload[] = [
  {
    name: "CityCare General Hospital",
    organizationType: OrganizationType.HOSPITAL,
    email: "contact@citycaregh.com",
    phone: "+1-212-555-0199",
    country: "United States",
    city: "New York",
    timezone: "America/New_York",
    address: "123 Madison Ave, New York, NY 10010",
    venueTemplateName: "Hospital Template",
    isActive: true,
  },
  {
    name: "Lakeside Regional Medical",
    organizationType: OrganizationType.HOSPITAL,
    email: "info@lakesideregional.org",
    phone: "+1-312-555-4411",
    country: "United States",
    city: "Chicago",
    timezone: "America/Chicago",
    address: "890 Lakeside Dr, Chicago, IL 60601",
    venueTemplateName: "Hospital Template",
    isActive: true,
  },
  {
    name: "SkyWays International Airport",
    organizationType: OrganizationType.AIRPORT,
    email: "support@skywaysairport.com",
    phone: "+44 20 7946 0110",
    country: "United Kingdom",
    city: "London",
    timezone: "Europe/London",
    address: "1 Aviation Ave, Hounslow TW6 1RU",
    venueTemplateName: "Airport Template",
    isActive: true,
  },
  {
    name: "Pacific Gateway Airport",
    organizationType: OrganizationType.AIRPORT,
    email: "hello@pacificgatewayairport.com",
    phone: "+61 2 5550 8877",
    country: "Australia",
    city: "Sydney",
    timezone: "Australia/Sydney",
    address: "22 Terminal Rd, Mascot NSW 2020",
    venueTemplateName: "Airport Template",
    isActive: true,
  },
  {
    name: "Harborfront Shopping Plaza",
    organizationType: OrganizationType.SHOPPING_MALL,
    email: "management@harborfrontplaza.com",
    phone: "+1-415-555-7721",
    country: "United States",
    city: "San Francisco",
    timezone: "America/Los_Angeles",
    address: "450 Market St, San Francisco, CA 94105",
    venueTemplateName: "Shopping Mall Template",
    isActive: true,
  },
  {
    name: "Aurora Grand Mall",
    organizationType: OrganizationType.SHOPPING_MALL,
    email: "admin@auroragrandmall.ca",
    phone: "+1-416-555-9087",
    country: "Canada",
    city: "Toronto",
    timezone: "America/Toronto",
    address: "300 Front St W, Toronto, ON M5V 3A5",
    venueTemplateName: "Shopping Mall Template",
    isActive: true,
  },
  {
    name: "Greenfield Innovation Campus",
    organizationType: OrganizationType.OPEN_PLACE,
    email: "campus@greenfieldinnovation.org",
    phone: "+49 30 5552 1120",
    country: "Germany",
    city: "Berlin",
    timezone: "Europe/Berlin",
    address: "15 Innovation Platz, 10115 Berlin",
    venueTemplateName: "Open Place Template",
    isActive: true,
  },
  {
    name: "Central City Commons",
    organizationType: OrganizationType.OPEN_PLACE,
    email: "team@centralcitycommons.sg",
    phone: "+65 6789 5510",
    country: "Singapore",
    city: "Singapore",
    timezone: "Asia/Singapore",
    address: "88 Marina View, Singapore 018967",
    venueTemplateName: "Open Place Template",
    isActive: false,
  },
];

const seedOrganizations = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await dbConnect();
    }

    const templates = await VenueTemplate.find({});
    if (!templates.length) {
      throw new Error(
        "No venue templates found. Please run the venue template seeder first.",
      );
    }

    const templateMap = new Map<string, mongoose.Types.ObjectId>();
    templates.forEach((template) => {
      templateMap.set(
        String(template.name).toLowerCase(),
        new mongoose.Types.ObjectId(String((template as any)._id))
      );
    });

    const adminUser = await AdminUser.findOne({ role: AdminRole.ADMIN }).select("_id");

    if (!adminUser) {
      console.warn("⚠️  No admin user found. Organizations will be seeded without creator information.");
    }

    const createdBy =
      adminUser && adminUser._id instanceof mongoose.Types.ObjectId
        ? adminUser._id
        : null;

    let createdCount = 0;
    let skippedCount = 0;
    let missingTemplateCount = 0;

    for (const orgData of organizationsToSeed) {
      const templateId = templateMap.get(orgData.venueTemplateName.toLowerCase());
      if (!templateId) {
        console.warn(
          `⚠️  Venue template "${orgData.venueTemplateName}" not found. Skipping organization "${orgData.name}".`,
        );
        missingTemplateCount++;
        continue;
      }

      const existing = await Organization.findOne({
        name: { $regex: new RegExp(`^${orgData.name}$`, "i") },
      });

      if (existing) {
        console.log(
          `⏭️  Organization "${orgData.name}" already exists, skipping...`,
        );
        skippedCount++;
        continue;
      }

      await Organization.create({
        organizationType: orgData.organizationType,
        name: orgData.name,
        email: orgData.email.toLowerCase(),
        phone: orgData.phone,
        country: orgData.country,
        city: orgData.city,
        timezone: orgData.timezone,
        address: orgData.address,
        venueTemplate: templateId,
        isActive: orgData.isActive ?? true,
        createdBy,
        updatedBy: createdBy,
      });

      console.log(`✅ Organization "${orgData.name}" created successfully!`);
      createdCount++;
    }

    console.log("\n📊 Organizations Seeding Summary:");
    console.log(`   ✅ Created: ${createdCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ⚠️  Missing Template: ${missingTemplateCount}`);
    console.log(`   📋 Total Planned: ${organizationsToSeed.length}`);
  } catch (error: any) {
    console.error("❌ Error seeding organizations:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedOrganizations()
    .then(() => {
      console.log("\n✅ Organizations seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Organizations seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedOrganizations;


