import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import MapEditorMeasurement from "../../models/admin/map-management/mapEditorMeasurement";
import MapFloorPlan from "../../models/admin/map-management/mapFloorPlan";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";

interface MeasurementTemplate {
  startPoint: {
    x: number;
    y: number;
  };
  endPoint: {
    x: number;
    y: number;
  };
  distance: number;
  unit: string;
  color?: string;
  strokeWidth?: number;
}

const groundFloorMeasurementTemplate: MeasurementTemplate[] = [
  {
    startPoint: { x: 100, y: 100 },
    endPoint: { x: 300, y: 100 },
    distance: 200,
    unit: "meters",
    color: "#2563EB",
    strokeWidth: 2,
  },
  {
    startPoint: { x: 150, y: 200 },
    endPoint: { x: 450, y: 350 },
    distance: 360,
    unit: "meters",
    color: "#2563EB",
    strokeWidth: 2,
  },
];

const upperFloorMeasurementTemplate: MeasurementTemplate[] = [
  {
    startPoint: { x: 100, y: 100 },
    endPoint: { x: 300, y: 100 },
    distance: 200,
    unit: "meters",
    color: "#2563EB",
    strokeWidth: 2,
  },
  {
    startPoint: { x: 200, y: 250 },
    endPoint: { x: 500, y: 400 },
    distance: 380,
    unit: "meters",
    color: "#2563EB",
    strokeWidth: 2,
  },
];

const getMeasurementTemplate = (
  floorNumber: number | null | undefined,
): MeasurementTemplate[] => {
  if (floorNumber === 0 || floorNumber === null || floorNumber === undefined) {
    return groundFloorMeasurementTemplate;
  }
  return upperFloorMeasurementTemplate;
};

const seedMapEditorMeasurements = async () => {
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
        "⚠️  No admin user found. Measurements will be seeded without creator information.",
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

      const measurementTemplate = getMeasurementTemplate(floorNumber);

      const existingMeasurementCount = await MapEditorMeasurement.countDocuments({
        floorPlan: floorPlanId,
      });

      if (existingMeasurementCount > 0) {
        console.log(
          `⏭️  Floor plan "${floorPlanTitle}" already has ${existingMeasurementCount} measurements, skipping...`,
        );
        floorPlansSkipped++;
        continue;
      }

      let floorCreatedCount = 0;

      console.log(
        `\n📏 Processing floor plan: "${floorPlanTitle}" (Floor ${floorNumber ?? "Ground"})`,
      );

      for (const measurementTemplateData of measurementTemplate) {
        const coordinateOffset = Math.floor(Math.random() * 20) - 10;
        const startX = Math.max(50, measurementTemplateData.startPoint.x + coordinateOffset);
        const startY = Math.max(50, measurementTemplateData.startPoint.y + coordinateOffset);
        const endX = Math.max(50, measurementTemplateData.endPoint.x + coordinateOffset);
        const endY = Math.max(50, measurementTemplateData.endPoint.y + coordinateOffset);

        const measurement = new MapEditorMeasurement({
          floorPlan: floorPlanId,
          startPoint: {
            x: startX,
            y: startY,
          },
          endPoint: {
            x: endX,
            y: endY,
          },
          distance: measurementTemplateData.distance,
          unit: measurementTemplateData.unit || "meters",
          color: measurementTemplateData.color || "#2563EB",
          strokeWidth: measurementTemplateData.strokeWidth || 2,
          isActive: true,
          createdBy,
          updatedBy: createdBy,
        });

        await measurement.save();
        floorCreatedCount++;
        totalCreatedCount++;
      }

      if (floorCreatedCount > 0) {
        console.log(
          `   ✅ Created ${floorCreatedCount} measurements for "${floorPlanTitle}"`,
        );
        floorPlansProcessed++;
      } else {
        console.log(
          `   ⏭️  No new measurements created`,
        );
        floorPlansSkipped++;
      }
    }

    console.log("\n📊 Map Editor Measurements Seeding Summary:");
    console.log(`   ✅ Created: ${totalCreatedCount} measurements`);
    console.log(`   ⏭️  Skipped: ${totalSkippedCount} measurements`);
    console.log(`   📍 Floor Plans Processed: ${floorPlansProcessed}`);
    console.log(`   ⏭️  Floor Plans Skipped: ${floorPlansSkipped}`);
    console.log(`   📋 Total Floor Plans: ${floorPlans.length}`);
  } catch (error: any) {
    console.error("❌ Error seeding map editor measurements:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedMapEditorMeasurements()
    .then(() => {
      console.log("\n✅ Map Editor Measurements seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Map Editor Measurements seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedMapEditorMeasurements;

