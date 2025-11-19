import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import MapFloorPlan from "../../models/admin/map-management/mapFloorPlan";
import MapBuilding from "../../models/admin/map-management/mapBuilding";
import Organization from "../../models/admin/organization/organization";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";
import { MapFloorPlanStatus } from "../../types/admin/map-management";

interface FloorPlanSeedData {
  organizationName: string;
  buildingName: string;
  title: string;
  floorLabel: string;
  floorNumber?: number;
  status?: MapFloorPlanStatus;
  media?: {
    fileUrl?: string;
    fileKey?: string;
  };
  metadata?: {
    scale?: string;
    description?: string;
    tags?: string[];
  };
  isTemplate?: boolean;
  versionNotes?: string;
}

const floorPlansToSeed: FloorPlanSeedData[] = [
  {
    organizationName: "CityCare General Hospital",
    buildingName: "Main Building",
    title: "Main Building Ground Floor",
    floorLabel: "Ground Floor",
    floorNumber: 0,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1648771/pexels-photo-1648771.jpeg",
      fileKey: "floor-plans/citycare-main-building-ground-floor",
    },
    metadata: {
      scale: "1:100",
      description: "Ground floor with reception, main entrance, and administrative offices",
      tags: ["ground-floor", "reception", "main-entrance"],
    },
    versionNotes: "Initial floor plan upload - Ground floor layout with reception and administrative areas",
  },
  {
    organizationName: "CityCare General Hospital",
    buildingName: "Main Building",
    title: "Main Building 1st Floor",
    floorLabel: "1st Floor",
    floorNumber: 1,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
      fileKey: "floor-plans/citycare-main-building-first-floor",
    },
    metadata: {
      scale: "1:100",
      description: "First floor with patient rooms and nursing stations",
      tags: ["first-floor", "patient-rooms", "nursing"],
    },
    versionNotes: "First floor patient care unit layout with 24 patient rooms and central nursing station",
  },
  {
    organizationName: "CityCare General Hospital",
    buildingName: "Main Building",
    title: "Main Building 2nd Floor",
    floorLabel: "2nd Floor",
    floorNumber: 2,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg",
      fileKey: "floor-plans/citycare-main-building-second-floor",
    },
    metadata: {
      scale: "1:100",
      description: "Second floor with surgical suites and recovery rooms",
      tags: ["second-floor", "surgery", "recovery"],
    },
    versionNotes: "Surgical floor with 6 operating rooms, recovery area, and surgical prep facilities",
  },
  {
    organizationName: "CityCare General Hospital",
    buildingName: "Main Building",
    title: "Main Building 3rd Floor",
    floorLabel: "3rd Floor",
    floorNumber: 3,
    status: MapFloorPlanStatus.DRAFT,
    media: {
      fileUrl: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg",
      fileKey: "floor-plans/citycare-main-building-third-floor",
    },
    metadata: {
      scale: "1:100",
      description: "Third floor with specialty clinics",
      tags: ["third-floor", "clinics", "specialty"],
    },
    versionNotes: "Draft version - Specialty clinics floor plan under review. Includes cardiology, orthopedics, and pediatrics departments",
  },
  {
    organizationName: "CityCare General Hospital",
    buildingName: "Emergency Wing",
    title: "Emergency Wing Ground Floor",
    floorLabel: "Ground Floor",
    floorNumber: 0,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg",
      fileKey: "floor-plans/citycare-emergency-wing-ground-floor",
    },
    metadata: {
      scale: "1:150",
      description: "Emergency department ground floor with triage and trauma bays",
      tags: ["emergency", "triage", "trauma"],
    },
    versionNotes: "Emergency department ground floor with 4 trauma bays, triage area, and ambulance bay access",
  },
  {
    organizationName: "CityCare General Hospital",
    buildingName: "Emergency Wing",
    title: "Emergency Wing 1st Floor",
    floorLabel: "1st Floor",
    floorNumber: 1,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg",
      fileKey: "floor-plans/citycare-emergency-wing-first-floor",
    },
    metadata: {
      scale: "1:150",
      description: "First floor with observation rooms and emergency patient care",
      tags: ["emergency", "observation", "patient-care"],
    },
    versionNotes: "Emergency observation unit with 12 observation rooms and dedicated nursing station",
  },
  {
    organizationName: "CityCare General Hospital",
    buildingName: "Emergency Wing",
    title: "Emergency Wing 2nd Floor",
    floorLabel: "2nd Floor",
    floorNumber: 2,
    status: MapFloorPlanStatus.DRAFT,
    media: {
      fileUrl: "https://images.pexels.com/photos/1591060/pexels-photo-1591060.jpeg",
      fileKey: "floor-plans/citycare-emergency-wing-second-floor",
    },
    metadata: {
      scale: "1:150",
      description: "Second floor with emergency surgical suites",
      tags: ["emergency", "surgery", "operating"],
    },
    versionNotes: "Draft - Emergency surgical floor with 2 emergency operating rooms and recovery area. Pending final approval",
  },
  {
    organizationName: "CityCare General Hospital",
    buildingName: "Diagnostic Center",
    title: "Diagnostic Center Ground Floor",
    floorLabel: "Ground Floor",
    floorNumber: 0,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/2280568/pexels-photo-2280568.jpeg",
      fileKey: "floor-plans/citycare-diagnostic-center-ground-floor",
    },
    metadata: {
      scale: "1:75",
      description: "Ground floor with imaging facilities and waiting areas",
      tags: ["diagnostic", "imaging", "radiology"],
    },
    versionNotes: "Diagnostic imaging floor with MRI suite, CT scanner, X-ray facilities, and patient waiting areas",
  },
  {
    organizationName: "CityCare General Hospital",
    buildingName: "Diagnostic Center",
    title: "Diagnostic Center 1st Floor",
    floorLabel: "1st Floor",
    floorNumber: 1,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/2280569/pexels-photo-2280569.jpeg",
      fileKey: "floor-plans/citycare-diagnostic-center-first-floor",
    },
    metadata: {
      scale: "1:75",
      description: "First floor with laboratories and testing facilities",
      tags: ["diagnostic", "laboratory", "testing"],
    },
    versionNotes: "Laboratory floor with clinical lab, blood work stations, and specimen collection area",
  },
  {
    organizationName: "Lakeside Regional Medical",
    buildingName: "Main Hospital Building",
    title: "Main Hospital Building Ground Floor",
    floorLabel: "Ground Floor",
    floorNumber: 0,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg",
      fileKey: "floor-plans/lakeside-main-hospital-ground-floor",
    },
    metadata: {
      scale: "1:100",
      description: "Main hospital building ground floor",
      tags: ["ground-floor", "hospital", "main"],
    },
    versionNotes: "Main hospital building ground floor with reception, main entrance, and administrative services",
  },
  {
    organizationName: "Lakeside Regional Medical",
    buildingName: "Main Hospital Building",
    title: "Main Hospital Building 1st Floor",
    floorLabel: "1st Floor",
    floorNumber: 1,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg",
      fileKey: "floor-plans/lakeside-main-hospital-first-floor",
    },
    metadata: {
      scale: "1:100",
      description: "First floor with patient care units",
      tags: ["first-floor", "patient-care"],
    },
    versionNotes: "Patient care unit with 20 patient rooms and 2 nursing stations",
  },
  {
    organizationName: "SkyWays International Airport",
    buildingName: "Terminal 1",
    title: "Terminal 1 Departure Level",
    floorLabel: "Departure Level",
    floorNumber: 2,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/28365735/pexels-photo-28365735.jpeg",
      fileKey: "floor-plans/skyways-terminal1-departure-level",
    },
    metadata: {
      scale: "1:200",
      description: "Terminal 1 departure level with check-in counters and security",
      tags: ["terminal", "departure", "check-in"],
    },
    versionNotes: "Terminal 1 departure level with 40 check-in counters, security checkpoints, and gates 1-20",
  },
  {
    organizationName: "SkyWays International Airport",
    buildingName: "Terminal 1",
    title: "Terminal 1 Arrival Level",
    floorLabel: "Arrival Level",
    floorNumber: 0,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/28640604/pexels-photo-28640604.jpeg",
      fileKey: "floor-plans/skyways-terminal1-arrival-level",
    },
    metadata: {
      scale: "1:200",
      description: "Terminal 1 arrival level with baggage claim and customs",
      tags: ["terminal", "arrival", "baggage"],
    },
    versionNotes: "Terminal 1 arrival level with 4 baggage carousels, customs area, and arrival gates",
  },
  {
    organizationName: "SkyWays International Airport",
    buildingName: "Terminal 2",
    title: "Terminal 2 International Departures",
    floorLabel: "International Departures",
    floorNumber: 3,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/9754/mountains-clouds-forest-fog.jpg",
      fileKey: "floor-plans/skyways-terminal2-international-departures",
    },
    metadata: {
      scale: "1:200",
      description: "Terminal 2 international departures with duty-free and lounges",
      tags: ["terminal", "international", "departures"],
    },
    versionNotes: "Terminal 2 international departures with duty-free shopping, VIP lounges, and international gates 21-40",
  },
  {
    organizationName: "Harborfront Shopping Plaza",
    buildingName: "North Wing",
    title: "North Wing Ground Floor",
    floorLabel: "Ground Floor",
    floorNumber: 0,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg",
      fileKey: "floor-plans/harborfront-north-wing-ground-floor",
    },
    metadata: {
      scale: "1:150",
      description: "North wing ground floor with retail stores",
      tags: ["retail", "shopping", "ground-floor"],
    },
    versionNotes: "North wing ground floor with 25 retail stores, food court with 12 vendors, and main entrance",
  },
  {
    organizationName: "Harborfront Shopping Plaza",
    buildingName: "North Wing",
    title: "North Wing 1st Floor",
    floorLabel: "1st Floor",
    floorNumber: 1,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg",
      fileKey: "floor-plans/harborfront-north-wing-first-floor",
    },
    metadata: {
      scale: "1:150",
      description: "North wing first floor with more retail and services",
      tags: ["retail", "shopping", "first-floor"],
    },
    versionNotes: "North wing first floor with additional retail stores, customer service desk, and restroom facilities",
  },
  {
    organizationName: "Aurora Grand Mall",
    buildingName: "Main Mall Building",
    title: "Main Mall Building Ground Floor",
    floorLabel: "Ground Floor",
    floorNumber: 0,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg",
      fileKey: "floor-plans/aurora-mall-ground-floor",
    },
    metadata: {
      scale: "1:150",
      description: "Main mall building ground floor",
      tags: ["mall", "shopping", "ground-floor"],
    },
    versionNotes: "Main mall building ground floor with main entrance, 30 retail stores, and central food court",
  },
  {
    organizationName: "Aurora Grand Mall",
    buildingName: "Main Mall Building",
    title: "Main Mall Building 1st Floor",
    floorLabel: "1st Floor",
    floorNumber: 1,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg",
      fileKey: "floor-plans/aurora-mall-first-floor",
    },
    metadata: {
      scale: "1:150",
      description: "First floor with entertainment and dining",
      tags: ["mall", "entertainment", "dining"],
    },
    versionNotes: "First floor with 8-screen cinema complex, 6 restaurants, and entertainment area",
  },
  {
    organizationName: "Greenfield Innovation Campus",
    buildingName: "Innovation Hub",
    title: "Innovation Hub Ground Floor",
    floorLabel: "Ground Floor",
    floorNumber: 0,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg",
      fileKey: "floor-plans/greenfield-innovation-hub-ground-floor",
    },
    metadata: {
      scale: "1:100",
      description: "Innovation hub ground floor with offices and meeting spaces",
      tags: ["innovation", "offices", "meetings"],
    },
    versionNotes: "Innovation hub ground floor with main lobby, 8 meeting rooms, and 15 office spaces",
  },
  {
    organizationName: "Greenfield Innovation Campus",
    buildingName: "Innovation Hub",
    title: "Innovation Hub 1st Floor",
    floorLabel: "1st Floor",
    floorNumber: 1,
    status: MapFloorPlanStatus.PUBLISHED,
    media: {
      fileUrl: "https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg",
      fileKey: "floor-plans/greenfield-innovation-hub-first-floor",
    },
    metadata: {
      scale: "1:100",
      description: "First floor with collaborative workspaces",
      tags: ["innovation", "workspaces", "collaboration"],
    },
    versionNotes: "First floor with open collaborative workspaces, 4 conference rooms, and break areas",
  },
];

const seedFloorPlans = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await dbConnect();
    }

    const organizations = await Organization.find({ isActive: true });
    if (!organizations.length) {
      throw new Error("No active organizations found. Please run the organization seeder first.");
    }

    const organizationMap = new Map<string, mongoose.Types.ObjectId>();
    organizations.forEach((org) => {
      const normalizedName = org.name.trim().toLowerCase();
      organizationMap.set(normalizedName, org._id as mongoose.Types.ObjectId);
    });

    const buildings = await MapBuilding.find({ isActive: true });
    if (!buildings.length) {
      throw new Error("No active buildings found. Please run the buildings seeder first.");
    }

    const buildingMap = new Map<string, { id: mongoose.Types.ObjectId; orgId: mongoose.Types.ObjectId }>();
    for (const building of buildings) {
      const orgId = building.organization as mongoose.Types.ObjectId;
      const normalizedBuildingName = building.name.trim().toLowerCase();
      const key = `${orgId.toString()}-${normalizedBuildingName}`;
      buildingMap.set(key, { id: building._id as mongoose.Types.ObjectId, orgId });
    }

    const adminUser = await AdminUser.findOne({ role: AdminRole.ADMIN }).select("_id");
    if (!adminUser) {
      console.warn("⚠️  No admin user found. Floor plans will be seeded without creator information.");
    }

    const createdBy =
      adminUser && adminUser._id instanceof mongoose.Types.ObjectId ? adminUser._id : null;

    let createdCount = 0;
    let skippedCount = 0;
    let missingBuildingCount = 0;

    for (const floorPlanData of floorPlansToSeed) {
      const normalizedOrgName = floorPlanData.organizationName.trim().toLowerCase();
      const orgId = organizationMap.get(normalizedOrgName);
      if (!orgId) {
        console.warn(
          `⚠️  Organization "${floorPlanData.organizationName}" not found. Skipping floor plan "${floorPlanData.title}".`,
        );
        missingBuildingCount++;
        continue;
      }

      const normalizedBuildingName = floorPlanData.buildingName.trim().toLowerCase();
      const buildingKey = `${orgId.toString()}-${normalizedBuildingName}`;
      const buildingInfo = buildingMap.get(buildingKey);

      if (!buildingInfo) {
        console.warn(
          `⚠️  Building "${floorPlanData.buildingName}" for "${floorPlanData.organizationName}" not found. Skipping floor plan "${floorPlanData.title}".`,
        );
        missingBuildingCount++;
        continue;
      }

      if (!buildingInfo.orgId.equals(orgId as mongoose.Types.ObjectId)) {
        console.warn(
          `⚠️  Building "${floorPlanData.buildingName}" does not belong to "${floorPlanData.organizationName}". Skipping floor plan "${floorPlanData.title}".`,
        );
        missingBuildingCount++;
        continue;
      }

      const normalizedFloorLabel = floorPlanData.floorLabel.trim();
      const existing = await MapFloorPlan.findOne({
        organization: orgId as mongoose.Types.ObjectId,
        building: buildingInfo.id,
        floorLabel: { $regex: new RegExp(`^${normalizedFloorLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });

      if (existing) {
        console.log(
          `⏭️  Floor plan "${floorPlanData.title}" already exists, skipping...`,
        );
        skippedCount++;
        continue;
      }

      const floorPlan = new MapFloorPlan({
        organization: orgId as mongoose.Types.ObjectId,
        building: buildingInfo.id,
        title: floorPlanData.title,
        floorLabel: floorPlanData.floorLabel,
        floorNumber: floorPlanData.floorNumber ?? null,
        status: floorPlanData.status || MapFloorPlanStatus.DRAFT,
        media: {
          fileUrl: floorPlanData.media?.fileUrl || null,
          fileKey: floorPlanData.media?.fileKey || null,
        },
        metadata: {
          scale: floorPlanData.metadata?.scale || null,
          description: floorPlanData.metadata?.description || null,
          tags: floorPlanData.metadata?.tags || [],
        },
        version: 1,
        versionNotes: floorPlanData.versionNotes || null,
        publishedAt: floorPlanData.status === MapFloorPlanStatus.PUBLISHED ? new Date() : null,
        isTemplate: floorPlanData.isTemplate || false,
        isActive: true,
        createdBy,
        updatedBy: createdBy,
      });

      await floorPlan.save();
      console.log(`✅ Floor plan "${floorPlanData.title}" created successfully!`);
      console.log(`   Building: ${floorPlanData.buildingName}`);
      console.log(`   Floor: ${floorPlanData.floorLabel}`);
      console.log(`   Status: ${floorPlan.status}`);
      createdCount++;
    }

    console.log("\n📊 Floor Plans Seeding Summary:");
    console.log(`   ✅ Created: ${createdCount} floor plans`);
    console.log(`   ⏭️  Skipped: ${skippedCount} floor plans`);
    console.log(`   ⚠️  Missing Building: ${missingBuildingCount} floor plans`);
    console.log(`   📋 Total: ${floorPlansToSeed.length} floor plans`);
  } catch (error: any) {
    console.error("❌ Error seeding floor plans:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedFloorPlans()
    .then(() => {
      console.log("\n✅ Floor plans seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Floor plans seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedFloorPlans;

