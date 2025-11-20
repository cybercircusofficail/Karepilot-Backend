import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import MapEditorEntrance from "../../models/admin/map-management/mapEditorEntrance";
import MapFloorPlan from "../../models/admin/map-management/mapFloorPlan";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";

interface EntranceTemplate {
  name: string;
  category: string;
  description?: string;
  coordinates: {
    x: number;
    y: number;
  };
  icon?: string;
  color?: string;
  isAccessible?: boolean;
}

const getEntranceColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    "Main Entrance": "#F59E0B",
    "Emergency Exit": "#DC2626",
    "Side Entrance": "#3D8C6C",
    "Staff Entrance": "#2563EB",
  };
  return colorMap[category] || "#6B7280";
};

const groundFloorEntranceTemplate: EntranceTemplate[] = [
  {
    name: "Main Entrance",
    category: "Main Entrance",
    description: "Primary entrance to the building with automatic doors",
    coordinates: { x: 200, y: 50 },
    color: getEntranceColor("Main Entrance"),
    isAccessible: true,
  },
  {
    name: "Emergency Exit - North",
    category: "Emergency Exit",
    description: "Emergency exit on the north side of the building",
    coordinates: { x: 100, y: 300 },
    color: getEntranceColor("Emergency Exit"),
    isAccessible: true,
  },
  {
    name: "Emergency Exit - South",
    category: "Emergency Exit",
    description: "Emergency exit on the south side of the building",
    coordinates: { x: 500, y: 300 },
    color: getEntranceColor("Emergency Exit"),
    isAccessible: true,
  },
  {
    name: "Side Entrance - East",
    category: "Side Entrance",
    description: "Side entrance for visitors and staff",
    coordinates: { x: 550, y: 150 },
    color: getEntranceColor("Side Entrance"),
    isAccessible: true,
  },
  {
    name: "Staff Entrance",
    category: "Staff Entrance",
    description: "Dedicated entrance for staff members with card access",
    coordinates: { x: 50, y: 200 },
    color: getEntranceColor("Staff Entrance"),
    isAccessible: true,
  },
];

const upperFloorEntranceTemplate: EntranceTemplate[] = [
  {
    name: "Emergency Exit - North",
    category: "Emergency Exit",
    description: "Emergency exit on the north side",
    coordinates: { x: 100, y: 50 },
    color: getEntranceColor("Emergency Exit"),
    isAccessible: true,
  },
  {
    name: "Emergency Exit - South",
    category: "Emergency Exit",
    description: "Emergency exit on the south side",
    coordinates: { x: 500, y: 350 },
    color: getEntranceColor("Emergency Exit"),
    isAccessible: true,
  },
  {
    name: "Staff Entrance",
    category: "Staff Entrance",
    description: "Staff entrance with card access",
    coordinates: { x: 50, y: 200 },
    color: getEntranceColor("Staff Entrance"),
    isAccessible: true,
  },
];

const getEntranceTemplate = (floorNumber: number | null | undefined): EntranceTemplate[] => {
  if (floorNumber === 0 || floorNumber === null || floorNumber === undefined) {
    return groundFloorEntranceTemplate;
  }
  return upperFloorEntranceTemplate;
};

const seedMapEditorEntrances = async () => {
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
        "⚠️  No admin user found. Entrances will be seeded without creator information.",
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

      const entranceTemplate = getEntranceTemplate(floorNumber);

      const existingEntranceCount = await MapEditorEntrance.countDocuments({
        floorPlan: floorPlanId,
      });

      if (existingEntranceCount > 0) {
        console.log(
          `⏭️  Floor plan "${floorPlanTitle}" already has ${existingEntranceCount} entrances, skipping...`,
        );
        floorPlansSkipped++;
        continue;
      }

      let floorCreatedCount = 0;
      let floorSkippedCount = 0;

      console.log(
        `\n🚪 Processing floor plan: "${floorPlanTitle}" (Floor ${floorNumber ?? "Ground"})`,
      );

      for (const entranceTemplateData of entranceTemplate) {
        const existing = await MapEditorEntrance.findOne({
          floorPlan: floorPlanId,
          name: entranceTemplateData.name.trim(),
        });

        if (existing) {
          floorSkippedCount++;
          continue;
        }

        const coordinateOffset = Math.floor(Math.random() * 20) - 10;
        const x = entranceTemplateData.coordinates.x + coordinateOffset;
        const y = entranceTemplateData.coordinates.y + coordinateOffset;

        const entrance = new MapEditorEntrance({
          floorPlan: floorPlanId,
          name: entranceTemplateData.name.trim(),
          category: entranceTemplateData.category.trim(),
          description: entranceTemplateData.description?.trim() || undefined,
          coordinates: {
            x: Math.max(50, x),
            y: Math.max(50, y),
          },
          icon: entranceTemplateData.icon?.trim() || undefined,
          color: entranceTemplateData.color || getEntranceColor(entranceTemplateData.category),
          isAccessible: entranceTemplateData.isAccessible ?? true,
          isActive: true,
          createdBy,
          updatedBy: createdBy,
        });

        await entrance.save();
        floorCreatedCount++;
        totalCreatedCount++;
      }

      if (floorCreatedCount > 0) {
        console.log(`   ✅ Created ${floorCreatedCount} entrances for "${floorPlanTitle}"`);
        if (floorSkippedCount > 0) {
          console.log(`   ⏭️  Skipped ${floorSkippedCount} existing entrances`);
        }
        floorPlansProcessed++;
      } else {
        console.log(`   ⏭️  No new entrances created (${floorSkippedCount} already exist)`);
        floorPlansSkipped++;
      }

      totalSkippedCount += floorSkippedCount;
    }

    console.log("\n📊 Map Editor Entrances Seeding Summary:");
    console.log(`   ✅ Created: ${totalCreatedCount} entrances`);
    console.log(`   ⏭️  Skipped: ${totalSkippedCount} entrances`);
    console.log(`   📍 Floor Plans Processed: ${floorPlansProcessed}`);
    console.log(`   ⏭️  Floor Plans Skipped: ${floorPlansSkipped}`);
    console.log(`   📋 Total Floor Plans: ${floorPlans.length}`);
  } catch (error: any) {
    console.error("❌ Error seeding map editor entrances:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedMapEditorEntrances()
    .then(() => {
      console.log("\n✅ Map Editor Entrances seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Map Editor Entrances seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedMapEditorEntrances;
