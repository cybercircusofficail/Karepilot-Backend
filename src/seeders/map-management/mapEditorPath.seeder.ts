import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import MapEditorPath from "../../models/admin/map-management/mapEditorPath";
import MapFloorPlan from "../../models/admin/map-management/mapFloorPlan";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";

interface PathTemplate {
  name?: string;
  points: Array<{
    x: number;
    y: number;
  }>;
  color?: string;
  strokeWidth?: number;
}

const getPathColor = (): string => {
  return "#2563EB";
};

const groundFloorPathTemplate: PathTemplate[] = [
  {
    name: "Main Entrance to Reception",
    points: [
      { x: 200, y: 50 },
      { x: 200, y: 80 },
      { x: 150, y: 100 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Reception to Elevator A",
    points: [
      { x: 150, y: 100 },
      { x: 225, y: 150 },
      { x: 300, y: 200 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Elevator A to Cafeteria",
    points: [
      { x: 300, y: 200 },
      { x: 350, y: 225 },
      { x: 400, y: 250 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Main Entrance to Pharmacy",
    points: [
      { x: 200, y: 50 },
      { x: 300, y: 80 },
      { x: 400, y: 100 },
      { x: 500, y: 150 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Reception to Emergency Exit North",
    points: [
      { x: 150, y: 100 },
      { x: 125, y: 200 },
      { x: 100, y: 300 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
];

const upperFloorPathTemplate: PathTemplate[] = [
  {
    name: "Elevator A to Nursing Station",
    points: [
      { x: 300, y: 300 },
      { x: 300, y: 250 },
      { x: 300, y: 200 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Nursing Station to Room 101",
    points: [
      { x: 300, y: 200 },
      { x: 225, y: 150 },
      { x: 150, y: 100 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Nursing Station to Room 102",
    points: [
      { x: 300, y: 200 },
      { x: 275, y: 150 },
      { x: 250, y: 100 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Nursing Station to Room 103",
    points: [
      { x: 300, y: 200 },
      { x: 325, y: 150 },
      { x: 350, y: 100 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Nursing Station to Room 104",
    points: [
      { x: 300, y: 200 },
      { x: 375, y: 150 },
      { x: 450, y: 100 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Elevator A to Emergency Exit North",
    points: [
      { x: 300, y: 300 },
      { x: 200, y: 175 },
      { x: 100, y: 50 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
  {
    name: "Elevator B to Emergency Exit South",
    points: [
      { x: 500, y: 300 },
      { x: 500, y: 325 },
      { x: 500, y: 350 },
    ],
    color: getPathColor(),
    strokeWidth: 3,
  },
];

const getPathTemplate = (floorNumber: number | null | undefined): PathTemplate[] => {
  if (floorNumber === 0 || floorNumber === null || floorNumber === undefined) {
    return groundFloorPathTemplate;
  }
  return upperFloorPathTemplate;
};

const seedMapEditorPaths = async () => {
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
        "⚠️  No admin user found. Paths will be seeded without creator information.",
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

      const pathTemplate = getPathTemplate(floorNumber);

      const existingPathCount = await MapEditorPath.countDocuments({
        floorPlan: floorPlanId,
      });

      if (existingPathCount > 0) {
        console.log(
          `⏭️  Floor plan "${floorPlanTitle}" already has ${existingPathCount} paths, skipping...`,
        );
        floorPlansSkipped++;
        continue;
      }

      let floorCreatedCount = 0;
      let floorSkippedCount = 0;

      console.log(
        `\n🛤️  Processing floor plan: "${floorPlanTitle}" (Floor ${floorNumber ?? "Ground"})`,
      );

      for (const pathTemplateData of pathTemplate) {
        if (pathTemplateData.name) {
          const existing = await MapEditorPath.findOne({
            floorPlan: floorPlanId,
            name: pathTemplateData.name.trim(),
          });

          if (existing) {
            floorSkippedCount++;
            continue;
          }
        }

        const offsetPoints = pathTemplateData.points.map((point) => {
          const coordinateOffset = Math.floor(Math.random() * 15) - 7;
          return {
            x: Math.max(50, point.x + coordinateOffset),
            y: Math.max(50, point.y + coordinateOffset),
          };
        });

        const path = new MapEditorPath({
          floorPlan: floorPlanId,
          name: pathTemplateData.name?.trim() || undefined,
          points: offsetPoints,
          color: pathTemplateData.color || getPathColor(),
          strokeWidth: pathTemplateData.strokeWidth || 3,
          isActive: true,
          createdBy,
          updatedBy: createdBy,
        });

        await path.save();
        floorCreatedCount++;
        totalCreatedCount++;
      }

      if (floorCreatedCount > 0) {
        console.log(`   ✅ Created ${floorCreatedCount} paths for "${floorPlanTitle}"`);
        if (floorSkippedCount > 0) {
          console.log(`   ⏭️  Skipped ${floorSkippedCount} existing paths`);
        }
        floorPlansProcessed++;
      } else {
        console.log(`   ⏭️  No new paths created (${floorSkippedCount} already exist)`);
        floorPlansSkipped++;
      }

      totalSkippedCount += floorSkippedCount;
    }

    console.log("\n📊 Map Editor Paths Seeding Summary:");
    console.log(`   ✅ Created: ${totalCreatedCount} paths`);
    console.log(`   ⏭️  Skipped: ${totalSkippedCount} paths`);
    console.log(`   📍 Floor Plans Processed: ${floorPlansProcessed}`);
    console.log(`   ⏭️  Floor Plans Skipped: ${floorPlansSkipped}`);
    console.log(`   📋 Total Floor Plans: ${floorPlans.length}`);
  } catch (error: any) {
    console.error("❌ Error seeding map editor paths:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedMapEditorPaths()
    .then(() => {
      console.log("\n✅ Map Editor Paths seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Map Editor Paths seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedMapEditorPaths;

