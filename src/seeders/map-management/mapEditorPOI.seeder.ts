import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import MapEditorPOI from "../../models/admin/map-management/mapEditorPOI";
import MapFloorPlan from "../../models/admin/map-management/mapFloorPlan";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";

interface POITemplate {
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

const getPOIColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    Room: "#3D8C6C",
    Reception: "#2563EB",
    Toilet: "#DC2626",
    Elevator: "#7C3AED",
    "Emergency Exit": "#F59E0B",
    Cafeteria: "#10B981",
    Pharmacy: "#EC4899",
    Laboratory: "#06B6D4",
  };
  return colorMap[category] || "#6B7280";
};

// Template POIs for Ground Floor (floorNumber === 0 or null)
const groundFloorPOITemplate: POITemplate[] = [
  {
    name: "Main Reception",
    category: "Reception",
    description: "Main reception desk for visitor check-in and information",
    coordinates: { x: 150, y: 100 },
    color: getPOIColor("Reception"),
    isAccessible: true,
  },
  {
    name: "Main Entrance",
    category: "Emergency Exit",
    description: "Primary entrance to the building",
    coordinates: { x: 200, y: 50 },
    color: getPOIColor("Emergency Exit"),
    isAccessible: true,
  },
  {
    name: "Restroom - Men",
    category: "Toilet",
    description: "Men's restroom facilities",
    coordinates: { x: 100, y: 150 },
    color: getPOIColor("Toilet"),
    isAccessible: true,
  },
  {
    name: "Restroom - Women",
    category: "Toilet",
    description: "Women's restroom facilities",
    coordinates: { x: 250, y: 150 },
    color: getPOIColor("Toilet"),
    isAccessible: true,
  },
  {
    name: "Elevator A",
    category: "Elevator",
    description: "Main elevator to upper floors",
    coordinates: { x: 300, y: 200 },
    color: getPOIColor("Elevator"),
    isAccessible: true,
  },
  {
    name: "Cafeteria",
    category: "Cafeteria",
    description: "Cafeteria and dining area",
    coordinates: { x: 400, y: 250 },
    color: getPOIColor("Cafeteria"),
    isAccessible: true,
  },
  {
    name: "Pharmacy",
    category: "Pharmacy",
    description: "Pharmacy for prescriptions",
    coordinates: { x: 500, y: 150 },
    color: getPOIColor("Pharmacy"),
    isAccessible: true,
  },
  {
    name: "Emergency Exit - North",
    category: "Emergency Exit",
    description: "Emergency exit on north side",
    coordinates: { x: 100, y: 300 },
    color: getPOIColor("Emergency Exit"),
    isAccessible: true,
  },
  {
    name: "Emergency Exit - South",
    category: "Emergency Exit",
    description: "Emergency exit on south side",
    coordinates: { x: 500, y: 300 },
    color: getPOIColor("Emergency Exit"),
    isAccessible: true,
  },
];

// Template POIs for Upper Floors (floorNumber > 0)
const upperFloorPOITemplate: POITemplate[] = [
  {
    name: "Room 101",
    category: "Room",
    description: "Standard room",
    coordinates: { x: 150, y: 100 },
    color: getPOIColor("Room"),
    isAccessible: true,
  },
  {
    name: "Room 102",
    category: "Room",
    description: "Standard room",
    coordinates: { x: 250, y: 100 },
    color: getPOIColor("Room"),
    isAccessible: true,
  },
  {
    name: "Room 103",
    category: "Room",
    description: "Standard room",
    coordinates: { x: 350, y: 100 },
    color: getPOIColor("Room"),
    isAccessible: true,
  },
  {
    name: "Room 104",
    category: "Room",
    description: "Standard room",
    coordinates: { x: 450, y: 100 },
    color: getPOIColor("Room"),
    isAccessible: true,
  },
  {
    name: "Nursing Station",
    category: "Reception",
    description: "Central nursing station",
    coordinates: { x: 300, y: 200 },
    color: getPOIColor("Reception"),
    isAccessible: true,
  },
  {
    name: "Elevator A",
    category: "Elevator",
    description: "Main elevator to other floors",
    coordinates: { x: 300, y: 300 },
    color: getPOIColor("Elevator"),
    isAccessible: true,
  },
  {
    name: "Elevator B",
    category: "Elevator",
    description: "Secondary elevator",
    coordinates: { x: 500, y: 300 },
    color: getPOIColor("Elevator"),
    isAccessible: true,
  },
  {
    name: "Emergency Exit - North",
    category: "Emergency Exit",
    description: "Emergency exit on north side",
    coordinates: { x: 100, y: 50 },
    color: getPOIColor("Emergency Exit"),
    isAccessible: true,
  },
  {
    name: "Emergency Exit - South",
    category: "Emergency Exit",
    description: "Emergency exit on south side",
    coordinates: { x: 500, y: 350 },
    color: getPOIColor("Emergency Exit"),
    isAccessible: true,
  },
  {
    name: "Restroom",
    category: "Toilet",
    description: "Restroom facilities",
    coordinates: { x: 450, y: 200 },
    color: getPOIColor("Toilet"),
    isAccessible: true,
  },
];

// Get POI template based on floor number
const getPOITemplate = (floorNumber: number | null | undefined): POITemplate[] => {
  if (floorNumber === 0 || floorNumber === null || floorNumber === undefined) {
    return groundFloorPOITemplate;
  }
  return upperFloorPOITemplate;
};

const seedMapEditorPOIs = async () => {
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
      console.warn("⚠️  No admin user found. POIs will be seeded without creator information.");
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

      // Get appropriate POI template based on floor number
      const poiTemplate = getPOITemplate(floorNumber);

      // Check if this floor plan already has POIs
      const existingPOICount = await MapEditorPOI.countDocuments({
        floorPlan: floorPlanId,
      });

      if (existingPOICount > 0) {
        console.log(
          `⏭️  Floor plan "${floorPlanTitle}" already has ${existingPOICount} POIs, skipping...`,
        );
        floorPlansSkipped++;
        continue;
      }

      let floorCreatedCount = 0;
      let floorSkippedCount = 0;

      console.log(`\n📍 Processing floor plan: "${floorPlanTitle}" (Floor ${floorNumber ?? "Ground"})`);

      for (const poiTemplateData of poiTemplate) {
        // Check if POI already exists
        const existing = await MapEditorPOI.findOne({
          floorPlan: floorPlanId,
          name: poiTemplateData.name.trim(),
        });

        if (existing) {
          floorSkippedCount++;
          continue;
        }

        // Add some randomization to coordinates to avoid exact duplicates across floors
        const coordinateOffset = Math.floor(Math.random() * 20) - 10; // -10 to +10
        const x = poiTemplateData.coordinates.x + coordinateOffset;
        const y = poiTemplateData.coordinates.y + coordinateOffset;

        const poi = new MapEditorPOI({
          floorPlan: floorPlanId,
          name: poiTemplateData.name.trim(),
          category: poiTemplateData.category.trim(),
          description: poiTemplateData.description?.trim() || undefined,
          coordinates: {
            x: Math.max(50, x), // Ensure minimum coordinates
            y: Math.max(50, y),
          },
          icon: poiTemplateData.icon?.trim() || undefined,
          color: poiTemplateData.color || getPOIColor(poiTemplateData.category),
          isAccessible: poiTemplateData.isAccessible ?? true,
          isActive: true,
          createdBy,
          updatedBy: createdBy,
        });

        await poi.save();
        floorCreatedCount++;
        totalCreatedCount++;
      }

      if (floorCreatedCount > 0) {
        console.log(`   ✅ Created ${floorCreatedCount} POIs for "${floorPlanTitle}"`);
        if (floorSkippedCount > 0) {
          console.log(`   ⏭️  Skipped ${floorSkippedCount} existing POIs`);
        }
        floorPlansProcessed++;
      } else {
        console.log(`   ⏭️  No new POIs created (${floorSkippedCount} already exist)`);
        floorPlansSkipped++;
      }

      totalSkippedCount += floorSkippedCount;
    }

    console.log("\n📊 Map Editor POIs Seeding Summary:");
    console.log(`   ✅ Created: ${totalCreatedCount} POIs`);
    console.log(`   ⏭️  Skipped: ${totalSkippedCount} POIs`);
    console.log(`   📍 Floor Plans Processed: ${floorPlansProcessed}`);
    console.log(`   ⏭️  Floor Plans Skipped: ${floorPlansSkipped}`);
    console.log(`   📋 Total Floor Plans: ${floorPlans.length}`);
  } catch (error: any) {
    console.error("❌ Error seeding map editor POIs:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedMapEditorPOIs()
    .then(() => {
      console.log("\n✅ Map Editor POIs seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Map Editor POIs seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedMapEditorPOIs;

