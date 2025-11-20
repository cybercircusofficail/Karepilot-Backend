import MapEditorAnnotation from "../../models/admin/map-management/mapEditorAnnotation";
import MapFloorPlan from "../../models/admin/map-management/mapFloorPlan";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";

interface AnnotationTemplate {
  name: string;
  description: string;
  type: string;
  coordinates: {
    x: number;
    y: number;
  };
  color: string;
}

const groundFloorAnnotationTemplate: AnnotationTemplate[] = [
  {
    name: "Main Reception Desk",
    description: "Primary check-in point for all visitors. Staff available 24/7",
    type: "POI",
    coordinates: { x: 150, y: 200 },
    color: "#F59E0B",
  },
  {
    name: "Emergency Exit Protocol",
    description: "In case of emergency, proceed to nearest marked exit. Do not use elevators.",
    type: "Safety",
    coordinates: { x: 400, y: 180 },
    color: "#EF4444",
  },
  {
    name: "Wheelchair Accessible Route",
    description: "This route provides barrier-free access to all ground floor facilities",
    type: "Accessibility",
    coordinates: { x: 250, y: 350 },
    color: "#3B82F6",
  },
  {
    name: "WiFi Zone",
    description: "Free high-speed WiFi available in this area. Network: Guest_WiFi",
    type: "Amenity",
    coordinates: { x: 550, y: 280 },
    color: "#8B5CF6",
  },
  {
    name: "Information Kiosk",
    description: "Digital directory and wayfinding assistance available here",
    type: "POI",
    coordinates: { x: 320, y: 450 },
    color: "#F59E0B",
  },
];

const upperFloorAnnotationTemplate: AnnotationTemplate[] = [
  {
    name: "Fire Assembly Point",
    description: "Gather here during fire drills or emergencies. Do not re-enter building until cleared.",
    type: "Safety",
    coordinates: { x: 200, y: 250 },
    color: "#EF4444",
  },
  {
    name: "AED Location",
    description: "Automated External Defibrillator available for emergency use",
    type: "Medical",
    coordinates: { x: 450, y: 320 },
    color: "#DC2626",
  },
  {
    name: "Quiet Zone",
    description: "Please maintain silence in this area. Reserved for focused work and meetings.",
    type: "Note",
    coordinates: { x: 350, y: 180 },
    color: "#6366F1",
  },
  {
    name: "Lactation Room",
    description: "Private room available for nursing mothers. Key available at reception.",
    type: "Amenity",
    coordinates: { x: 280, y: 400 },
    color: "#8B5CF6",
  },
];

export const seedMapEditorAnnotations = async () => {
  try {
    console.log("Seeding Map Editor Annotations...");

    const floorPlans = await MapFloorPlan.find({ isActive: true });
    if (!floorPlans.length) {
      console.log("❌ No floor plans found, skipping annotation seeding");
      return;
    }

    const adminUser = await AdminUser.findOne({ role: AdminRole.ADMIN }).select("_id");
    if (!adminUser) {
      console.warn(
        "⚠️  No admin user found. Annotations will be seeded without creator information.",
      );
    }

    const createdBy = adminUser?._id || null;

    await MapEditorAnnotation.deleteMany({});
    console.log("🗑️  Deleted existing annotations");

    let annotationCount = 0;

    console.log(`\n📋 Processing ${floorPlans.length} floor plans...\n`);

    for (const floorPlan of floorPlans) {
      const floorNumber = (floorPlan as any).floorNumber;
      const floorLabel = (floorPlan as any).floorLabel || "";
      
      // Determine if it's ground floor
      const isGroundFloor = 
        floorNumber === 0 ||
        floorNumber === 1 ||
        floorLabel.toLowerCase().includes("ground") ||
        floorLabel.toLowerCase().includes("first");

      const template = isGroundFloor
        ? groundFloorAnnotationTemplate
        : upperFloorAnnotationTemplate;

      for (const annotationData of template) {
        await MapEditorAnnotation.create({
          floorPlan: floorPlan._id,
          name: annotationData.name,
          description: annotationData.description,
          type: annotationData.type,
          coordinates: annotationData.coordinates,
          color: annotationData.color,
          isActive: true,
          createdBy,
          updatedBy: createdBy,
        });
        annotationCount++;
      }

      console.log(
        `✅ Created ${template.length} annotations for floor plan: "${(floorPlan as any).title || floorLabel}"`
      );
    }

    console.log(
      `\n✨ Map Editor Annotation seeding completed successfully! Total annotations: ${annotationCount}`
    );
  } catch (error) {
    console.error("❌ Error seeding Map Editor Annotations:", error);
    throw error;
  }
};

