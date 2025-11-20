import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import MapEditorElevator from "../../models/admin/map-management/mapEditorElevator";
import MapFloorPlan from "../../models/admin/map-management/mapFloorPlan";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";

interface ElevatorTemplate {
  name: string;
  description?: string;
  coordinates: {
    x: number;
    y: number;
  };
  connectsToFloors: string[];
  color?: string;
  isAccessible?: boolean;
}

const getElevatorColor = (): string => {
  return "#7C3AED"; 
};

const groundFloorElevatorTemplate: ElevatorTemplate[] = [
  {
    name: "Elevator A",
    description: "Main elevator serving all floors",
    coordinates: { x: 300, y: 200 },
    connectsToFloors: [
      "Basement",
      "Ground Floor",
      "Floor 1",
      "Floor 2",
      "Floor 3",
      "Floor 4",
      "Floor 5",
    ],
    color: getElevatorColor(),
    isAccessible: true,
  },
  {
    name: "Elevator B",
    description: "Secondary elevator for upper floors",
    coordinates: { x: 500, y: 300 },
    connectsToFloors: ["Ground Floor", "Floor 1", "Floor 2", "Floor 3"],
    color: getElevatorColor(),
    isAccessible: true,
  },
  {
    name: "Service Elevator",
    description: "Service elevator for staff and deliveries",
    coordinates: { x: 100, y: 250 },
    connectsToFloors: ["Basement", "Ground Floor", "Floor 1"],
    color: getElevatorColor(),
    isAccessible: false,
  },
];

const upperFloorElevatorTemplate: ElevatorTemplate[] = [
  {
    name: "Elevator A",
    description: "Main elevator serving all floors",
    coordinates: { x: 300, y: 300 },
    connectsToFloors: [
      "Basement",
      "Ground Floor",
      "Floor 1",
      "Floor 2",
      "Floor 3",
      "Floor 4",
      "Floor 5",
    ],
    color: getElevatorColor(),
    isAccessible: true,
  },
  {
    name: "Elevator B",
    description: "Secondary elevator",
    coordinates: { x: 500, y: 300 },
    connectsToFloors: ["Ground Floor", "Floor 1", "Floor 2", "Floor 3"],
    color: getElevatorColor(),
    isAccessible: true,
  },
];

const getElevatorTemplate = (floorNumber: number | null | undefined): ElevatorTemplate[] => {
  if (floorNumber === 0 || floorNumber === null || floorNumber === undefined) {
    return groundFloorElevatorTemplate;
  }
  return upperFloorElevatorTemplate;
};

const seedMapEditorElevators = async () => {
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
        "⚠️  No admin user found. Elevators will be seeded without creator information.",
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

      const elevatorTemplate = getElevatorTemplate(floorNumber);

      const existingElevatorCount = await MapEditorElevator.countDocuments({
        floorPlan: floorPlanId,
      });

      if (existingElevatorCount > 0) {
        console.log(
          `⏭️  Floor plan "${floorPlanTitle}" already has ${existingElevatorCount} elevators, skipping...`,
        );
        floorPlansSkipped++;
        continue;
      }

      let floorCreatedCount = 0;
      let floorSkippedCount = 0;

      console.log(
        `\n🛗 Processing floor plan: "${floorPlanTitle}" (Floor ${floorNumber ?? "Ground"})`,
      );

      for (const elevatorTemplateData of elevatorTemplate) {
        const existing = await MapEditorElevator.findOne({
          floorPlan: floorPlanId,
          name: elevatorTemplateData.name.trim(),
        });

        if (existing) {
          floorSkippedCount++;
          continue;
        }

        const coordinateOffset = Math.floor(Math.random() * 20) - 10; 
        const x = elevatorTemplateData.coordinates.x + coordinateOffset;
        const y = elevatorTemplateData.coordinates.y + coordinateOffset;

        const elevator = new MapEditorElevator({
          floorPlan: floorPlanId,
          name: elevatorTemplateData.name.trim(),
          description: elevatorTemplateData.description?.trim() || undefined,
          coordinates: {
            x: Math.max(50, x),
            y: Math.max(50, y),
          },
          connectsToFloors: elevatorTemplateData.connectsToFloors,
          color: elevatorTemplateData.color || getElevatorColor(),
          isAccessible: elevatorTemplateData.isAccessible ?? true,
          isActive: true,
          createdBy,
          updatedBy: createdBy,
        });

        await elevator.save();
        floorCreatedCount++;
        totalCreatedCount++;
      }

      if (floorCreatedCount > 0) {
        console.log(`   ✅ Created ${floorCreatedCount} elevators for "${floorPlanTitle}"`);
        if (floorSkippedCount > 0) {
          console.log(`   ⏭️  Skipped ${floorSkippedCount} existing elevators`);
        }
        floorPlansProcessed++;
      } else {
        console.log(`   ⏭️  No new elevators created (${floorSkippedCount} already exist)`);
        floorPlansSkipped++;
      }

      totalSkippedCount += floorSkippedCount;
    }

    console.log("\n📊 Map Editor Elevators Seeding Summary:");
    console.log(`   ✅ Created: ${totalCreatedCount} elevators`);
    console.log(`   ⏭️  Skipped: ${totalSkippedCount} elevators`);
    console.log(`   📍 Floor Plans Processed: ${floorPlansProcessed}`);
    console.log(`   ⏭️  Floor Plans Skipped: ${floorPlansSkipped}`);
    console.log(`   📋 Total Floor Plans: ${floorPlans.length}`);
  } catch (error: any) {
    console.error("❌ Error seeding map editor elevators:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedMapEditorElevators()
    .then(() => {
      console.log("\n✅ Map Editor Elevators seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Map Editor Elevators seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedMapEditorElevators;
