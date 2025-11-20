import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import MapEditorRestrictedZone from "../../models/admin/map-management/mapEditorRestrictedZone";
import MapFloorPlan from "../../models/admin/map-management/mapFloorPlan";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";

interface RestrictedZoneTemplate {
  name: string;
  description?: string;
  restrictionType: "Staff Only" | "Authorized Personnel" | "Emergency Access Only";
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color?: string;
}

const getRestrictedZoneColor = (): string => {
  return "#EF4444";
};

const groundFloorRestrictedZoneTemplate: RestrictedZoneTemplate[] = [
  {
    name: "Staff Only Area",
    description: "Restricted area for staff members only",
    restrictionType: "Staff Only",
    coordinates: { x: 50, y: 50, width: 150, height: 100 },
    color: getRestrictedZoneColor(),
  },
  {
    name: "Storage Room",
    description: "Authorized personnel only",
    restrictionType: "Authorized Personnel",
    coordinates: { x: 450, y: 200, width: 100, height: 80 },
    color: getRestrictedZoneColor(),
  },
  {
    name: "Maintenance Area",
    description: "Restricted maintenance zone",
    restrictionType: "Staff Only",
    coordinates: { x: 100, y: 350, width: 120, height: 90 },
    color: getRestrictedZoneColor(),
  },
];

const upperFloorRestrictedZoneTemplate: RestrictedZoneTemplate[] = [
  {
    name: "Staff Only Area",
    description: "Restricted area for staff members only",
    restrictionType: "Staff Only",
    coordinates: { x: 50, y: 50, width: 150, height: 100 },
    color: getRestrictedZoneColor(),
  },
  {
    name: "Equipment Storage",
    description: "Authorized personnel only",
    restrictionType: "Authorized Personnel",
    coordinates: { x: 450, y: 200, width: 100, height: 80 },
    color: getRestrictedZoneColor(),
  },
  {
    name: "Medical Supplies",
    description: "Restricted medical supplies area",
    restrictionType: "Authorized Personnel",
    coordinates: { x: 200, y: 300, width: 120, height: 90 },
    color: getRestrictedZoneColor(),
  },
];

const getRestrictedZoneTemplate = (
  floorNumber: number | null | undefined,
): RestrictedZoneTemplate[] => {
  if (floorNumber === 0 || floorNumber === null || floorNumber === undefined) {
    return groundFloorRestrictedZoneTemplate;
  }
  return upperFloorRestrictedZoneTemplate;
};

const seedMapEditorRestrictedZones = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await dbConnect();
    }

    const floorPlans = await MapFloorPlan.find({ isActive: true });
    if (!floorPlans.length) {
      throw new Error("No active floor plans found. Please run the floor plans seeder first.");
    }

    const adminUser = await AdminUser.findOne({ role: AdminRole.ADMIN }).select("_id");
    if (!adminUser) {
      console.warn(
        "⚠️  No admin user found. Restricted zones will be seeded without creator information.",
      );
    }

    const createdBy =
      adminUser && adminUser._id instanceof mongoose.Types.ObjectId ? adminUser._id : null;

    let totalCreatedCount = 0;
    let totalSkippedCount = 0;
    let floorPlansProcessed = 0;
    let floorPlansSkipped = 0;

    console.log(`\n📋 Processing ${floorPlans.length} floor plans...\n`);

    for (const floorPlan of floorPlans) {
      const floorPlanId = floorPlan._id as mongoose.Types.ObjectId;
      const floorNumber = floorPlan.floorNumber;
      const floorPlanTitle = floorPlan.title;

      const restrictedZoneTemplate = getRestrictedZoneTemplate(floorNumber);

      const existingRestrictedZoneCount = await MapEditorRestrictedZone.countDocuments({
        floorPlan: floorPlanId,
      });

      if (existingRestrictedZoneCount > 0) {
        console.log(
          `⏭️  Floor plan "${floorPlanTitle}" already has ${existingRestrictedZoneCount} restricted zones, skipping...`,
        );
        floorPlansSkipped++;
        continue;
      }

      let floorCreatedCount = 0;
      let floorSkippedCount = 0;

      console.log(
        `\n🚫 Processing floor plan: "${floorPlanTitle}" (Floor ${floorNumber ?? "Ground"})`,
      );

      for (const restrictedZoneTemplateData of restrictedZoneTemplate) {
        const existing = await MapEditorRestrictedZone.findOne({
          floorPlan: floorPlanId,
          name: restrictedZoneTemplateData.name.trim(),
        });

        if (existing) {
          floorSkippedCount++;
          continue;
        }

        const coordinateOffset = Math.floor(Math.random() * 20) - 10;
        const x = Math.max(50, restrictedZoneTemplateData.coordinates.x + coordinateOffset);
        const y = Math.max(50, restrictedZoneTemplateData.coordinates.y + coordinateOffset);

        const restrictedZone = new MapEditorRestrictedZone({
          floorPlan: floorPlanId,
          name: restrictedZoneTemplateData.name.trim(),
          description: restrictedZoneTemplateData.description?.trim() || undefined,
          restrictionType: restrictedZoneTemplateData.restrictionType,
          coordinates: {
            x,
            y,
            width: restrictedZoneTemplateData.coordinates.width,
            height: restrictedZoneTemplateData.coordinates.height,
          },
          color: restrictedZoneTemplateData.color || getRestrictedZoneColor(),
          isActive: true,
          createdBy,
          updatedBy: createdBy,
        });

        await restrictedZone.save();
        floorCreatedCount++;
        totalCreatedCount++;
      }

      if (floorCreatedCount > 0) {
        console.log(
          `   ✅ Created ${floorCreatedCount} restricted zones for "${floorPlanTitle}"`,
        );
        if (floorSkippedCount > 0) {
          console.log(`   ⏭️  Skipped ${floorSkippedCount} existing restricted zones`);
        }
        floorPlansProcessed++;
      } else {
        console.log(
          `   ⏭️  No new restricted zones created (${floorSkippedCount} already exist)`,
        );
        floorPlansSkipped++;
      }

      totalSkippedCount += floorSkippedCount;
    }

    console.log("\n📊 Map Editor Restricted Zones Seeding Summary:");
    console.log(`   ✅ Created: ${totalCreatedCount} restricted zones`);
    console.log(`   ⏭️  Skipped: ${totalSkippedCount} restricted zones`);
    console.log(`   📍 Floor Plans Processed: ${floorPlansProcessed}`);
    console.log(`   ⏭️  Floor Plans Skipped: ${floorPlansSkipped}`);
    console.log(`   📋 Total Floor Plans: ${floorPlans.length}`);
  } catch (error: any) {
    console.error("❌ Error seeding map editor restricted zones:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedMapEditorRestrictedZones()
    .then(() => {
      console.log("\n✅ Map Editor Restricted Zones seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Map Editor Restricted Zones seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedMapEditorRestrictedZones;

