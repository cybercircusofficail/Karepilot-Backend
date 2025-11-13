import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import Organization from "../../models/admin/organization/organization";
import MapBuilding from "../../models/admin/map-manager/mapBuilding";
import MapFloor from "../../models/admin/map-manager/mapFloor";
import MapManagerSettings from "../../models/admin/map-manager/mapSettings";
import FloorPlan, {
  IFloorPlanFileMetadata,
  IFloorPlanPreview,
} from "../../models/admin/map-manager/floorPlan";
import { FloorPlanStatus, MapLayerType } from "../../models/admin/map-manager";
import AdminUser from "../../models/admin/user-management/users";
import { AdminRole } from "../../models/admin/user-management/roles-permissions";

interface FloorSeedData {
  name: string;
  code: string;
  level: number;
  sequence: number;
  description: string;
  isBasement?: boolean;
  isDefault?: boolean;
  tags?: string[];
  attributes?: Record<string, any>;
}

interface FloorPlanSeedData {
  floorName: string;
  name: string;
  status?: FloorPlanStatus;
  description?: string;
  scale?: string;
  tags?: string[];
  previewUrl?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  fileSizeInBytes?: number;
}

interface BuildingSeedData {
  name: string;
  code: string;
  description: string;
  tags: string[];
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  geoLocation?: {
    latitude?: number;
    longitude?: number;
  };
  metadata?: Record<string, any>;
  floors: FloorSeedData[];
  floorPlans?: FloorPlanSeedData[];
}

interface MapManagerSettingsSeed {
  autoPublishUpdates?: boolean;
  highResThumbnails?: boolean;
  enableVersionControl?: boolean;
  defaultGridSize?: number;
  defaultGridUnit?: "px" | "ft" | "m";
  defaultSnapToGrid?: boolean;
  defaultShowGrid?: boolean;
  defaultZoom?: number;
  defaultMapScale?: string;
  allowedFileTypes?: string[];
  maxUploadSizeMb?: number;
  defaultLayerVisibility?: Record<MapLayerType, boolean>;
  notificationPreferences?: {
    publishSuccess?: boolean;
    publishFailure?: boolean;
    approvalRequired?: boolean;
  };
  retentionPolicy?: {
    keepDraftVersions?: number;
    keepPublishedSnapshots?: number;
  };
}

interface MapManagerSeedPayload {
  organizationName: string;
  buildings: BuildingSeedData[];
  settings?: MapManagerSettingsSeed;
}

const mapManagerSeedData: MapManagerSeedPayload[] = [
  {
    organizationName: "CityCare General Hospital",
    settings: {
      autoPublishUpdates: false,
      highResThumbnails: true,
      enableVersionControl: true,
      defaultGridSize: 25,
      defaultGridUnit: "ft",
      defaultSnapToGrid: true,
      defaultShowGrid: true,
      defaultZoom: 150,
      defaultMapScale: "1:150",
      allowedFileTypes: ["pdf", "png", "jpg", "svg", "dwg"],
      maxUploadSizeMb: 120,
      defaultLayerVisibility: {
        [MapLayerType.FLOOR_PLAN]: true,
        [MapLayerType.POI]: true,
        [MapLayerType.PATH]: true,
        [MapLayerType.ZONE]: true,
        [MapLayerType.LABEL]: true,
        [MapLayerType.ENTRANCE]: true,
        [MapLayerType.ELEVATOR]: true,
        [MapLayerType.RESTRICTED_ZONE]: true,
        [MapLayerType.TAG]: true,
        [MapLayerType.RULER]: false,
        [MapLayerType.MEASUREMENT]: false,
        [MapLayerType.ANNOTATION]: true,
        [MapLayerType.MESSAGE]: true,
        [MapLayerType.MEDIA]: false,
      },
      notificationPreferences: {
        publishSuccess: true,
        publishFailure: true,
        approvalRequired: true,
      },
      retentionPolicy: {
        keepDraftVersions: 15,
        keepPublishedSnapshots: 8,
      },
    },
    buildings: [
      {
        name: "North Tower",
        code: "CC-NORTH",
        description:
          "Primary inpatient facility with surgical suites, specialty clinics, and a rooftop helipad.",
        tags: ["inpatient", "surgery", "critical-care"],
        address: {
          line1: "123 Madison Ave",
          line2: "North Wing",
          city: "New York",
          state: "NY",
          postalCode: "10010",
          country: "USA",
        },
        geoLocation: {
          latitude: 40.744,
          longitude: -73.9876,
        },
        metadata: {
          totalBeds: 420,
          traumaLevel: "Level 1",
          rooftopHelipad: true,
        },
        floors: [
          {
            name: "Ground Floor",
            code: "NT-G0",
            level: 0,
            sequence: 0,
            description: "Main lobby, admissions, radiology imaging, and ambulance bay access.",
            tags: ["lobby", "imaging", "admissions"],
            isDefault: true,
          },
          {
            name: "Surgical Level",
            code: "NT-L2",
            level: 2,
            sequence: 20,
            description: "Operating theaters, recovery suites, and sterile processing center.",
            tags: ["surgery", "recovery"],
          },
          {
            name: "Intensive Care",
            code: "NT-L5",
            level: 5,
            sequence: 50,
            description: "Critical care units and specialized cardiac monitoring pods.",
            tags: ["ICU", "cardiac"],
          },
        ],
        floorPlans: [
          {
            floorName: "Ground Floor",
            name: "Emergency Operations",
            status: FloorPlanStatus.PUBLISHED,
            description: "Ground floor triage and radiology layout.",
            scale: "1:150",
            tags: ["emergency", "radiology"],
            previewUrl:
              "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/emergency-operations.pdf",
            fileName: "emergency-operations.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 2560000,
          },
          {
            floorName: "Surgical Level",
            name: "Operating Theaters",
            status: FloorPlanStatus.IN_PROGRESS,
            description: "Operating rooms and sterile processing layout.",
            scale: "1:200",
            tags: ["surgery", "sterile"],
            previewUrl:
              "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/operating-theaters.pdf",
            fileName: "operating-theaters.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 3120000,
          },
        ],
      },
      {
        name: "Emergency Pavilion",
        code: "CC-ER",
        description:
          "24/7 emergency and trauma pavilion with rapid triage and diagnostic capabilities.",
        tags: ["emergency", "trauma", "diagnostics"],
        address: {
          line1: "125 Madison Ave",
          city: "New York",
          state: "NY",
          postalCode: "10010",
          country: "USA",
        },
        geoLocation: {
          latitude: 40.7444,
          longitude: -73.9883,
        },
        metadata: {
          traumaBays: 12,
          isolationRooms: 6,
          pediatricWing: true,
        },
        floors: [
          {
            name: "Emergency Intake",
            code: "EP-L1",
            level: 1,
            sequence: 10,
            description: "Rapid triage, trauma bays, and advanced diagnostics.",
            tags: ["triage", "diagnostics"],
            isDefault: true,
          },
          {
            name: "Observation & Step-Down",
            code: "EP-L2",
            level: 2,
            sequence: 20,
            description: "Step-down unit with telemetry and observation suites.",
            tags: ["observation"],
          },
          {
            name: "Critical Isolation",
            code: "EP-LB1",
            level: -1,
            sequence: 5,
            description: "Negative-pressure isolation units and decontamination vestibules.",
            tags: ["isolation", "negative-pressure"],
            isBasement: true,
          },
        ],
        floorPlans: [
          {
            floorName: "Emergency Intake",
            name: "Rapid Triage Layout",
            status: FloorPlanStatus.PUBLISHED,
            description: "Trauma bay arrangement and diagnostic radiology access.",
            scale: "1:180",
            tags: ["trauma", "diagnostics"],
            previewUrl:
              "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/rapid-triage-layout.pdf",
            fileName: "rapid-triage-layout.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 1980000,
          },
          {
            floorName: "Observation & Step-Down",
            name: "Observation Suites",
            status: FloorPlanStatus.DRAFT,
            description: "Telemetry monitoring and observation suites layout.",
            scale: "1:160",
            tags: ["observation", "telemetry"],
            previewUrl:
              "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/observation-suites.pdf",
            fileName: "observation-suites.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 2240000,
          },
        ],
      },
    ],
  },
  {
    organizationName: "SkyWays International Airport",
    settings: {
      autoPublishUpdates: true,
      highResThumbnails: true,
      enableVersionControl: true,
      defaultGridSize: 10,
      defaultGridUnit: "m",
      defaultSnapToGrid: false,
      defaultShowGrid: false,
      defaultZoom: 120,
      defaultMapScale: "1:250",
      allowedFileTypes: ["pdf", "svg", "png"],
      maxUploadSizeMb: 80,
      defaultLayerVisibility: {
        [MapLayerType.FLOOR_PLAN]: true,
        [MapLayerType.POI]: true,
        [MapLayerType.PATH]: true,
        [MapLayerType.ZONE]: true,
        [MapLayerType.LABEL]: true,
        [MapLayerType.ENTRANCE]: true,
        [MapLayerType.ELEVATOR]: true,
        [MapLayerType.RESTRICTED_ZONE]: true,
        [MapLayerType.TAG]: true,
        [MapLayerType.RULER]: true,
        [MapLayerType.MEASUREMENT]: true,
        [MapLayerType.ANNOTATION]: true,
        [MapLayerType.MESSAGE]: false,
        [MapLayerType.MEDIA]: true,
      },
      notificationPreferences: {
        publishSuccess: true,
        publishFailure: true,
        approvalRequired: false,
      },
      retentionPolicy: {
        keepDraftVersions: 10,
        keepPublishedSnapshots: 6,
      },
    },
    buildings: [
      {
        name: "Terminal 1",
        code: "SKY-T1",
        description:
          "International departures terminal with long-haul gates, lounges, and customs.",
        tags: ["terminal", "departures", "international"],
        address: {
          line1: "1 Aviation Ave",
          city: "London",
          state: "London",
          postalCode: "TW6 1RU",
          country: "United Kingdom",
        },
        geoLocation: {
          latitude: 51.4706,
          longitude: -0.461941,
        },
        metadata: {
          gates: 24,
          premiumLounges: 5,
          hourlyPassengerCapacity: 8600,
        },
        floors: [
          {
            name: "Arrivals Hall",
            code: "T1-ARR",
            level: 0,
            sequence: 0,
            description: "Immigration, baggage claim, ground transport hub.",
            tags: ["arrivals", "baggage"],
            isDefault: true,
          },
          {
            name: "Departures Concourse",
            code: "T1-DEP",
            level: 1,
            sequence: 10,
            description: "Security screening, duty free retail, premium lounges.",
            tags: ["departures", "retail"],
          },
          {
            name: "Gate Level",
            code: "T1-GATE",
            level: 2,
            sequence: 20,
            description: "Jet bridges, boarding gates, aircraft access monitoring.",
            tags: ["gates"],
          },
        ],
        floorPlans: [
          {
            floorName: "Arrivals Hall",
            name: "Arrivals Processing Layout",
            status: FloorPlanStatus.PUBLISHED,
            description: "Immigration counters, baggage claim, and transport hub.",
            scale: "1:250",
            tags: ["arrivals", "immigration"],
            previewUrl:
              "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/arrivals-processing.pdf",
            fileName: "arrivals-processing.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 3480000,
          },
          {
            floorName: "Departures Concourse",
            name: "Departure Concourse",
            status: FloorPlanStatus.PUBLISHED,
            description: "Security checkpoints and duty-free retail configuration.",
            scale: "1:220",
            tags: ["departures", "retail"],
            previewUrl:
              "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/departure-concourse.pdf",
            fileName: "departure-concourse.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 3020000,
          },
        ],
      },
      {
        name: "Cargo & Logistics Center",
        code: "SKY-CARGO",
        description:
          "Dedicated cargo operations hub with cold chain storage and customs inspection.",
        tags: ["cargo", "logistics", "operations"],
        address: {
          line1: "18 Freight Road",
          city: "London",
          state: "London",
          postalCode: "TW6 3XA",
          country: "United Kingdom",
        },
        geoLocation: {
          latitude: 51.473,
          longitude: -0.4502,
        },
        metadata: {
          bondedWarehouses: 3,
          coldChainCapacityCubicMeters: 12000,
          customsInspectionLanes: 8,
        },
        floors: [
          {
            name: "Operations Floor",
            code: "CG-L1",
            level: 1,
            sequence: 10,
            description: "Cargo handling, sorting belts, customs processing.",
            tags: ["operations"],
            isDefault: true,
          },
          {
            name: "Cold Storage Level",
            code: "CG-LB1",
            level: -1,
            sequence: 5,
            description: "Temperature-controlled storage for pharmaceuticals and perishables.",
            tags: ["cold-chain", "storage"],
            isBasement: true,
          },
        ],
        floorPlans: [
          {
            floorName: "Operations Floor",
            name: "Cargo Operations Flow",
            status: FloorPlanStatus.PUBLISHED,
            description: "Cargo sorting belts and customs inspection layout.",
            scale: "1:300",
            tags: ["cargo", "logistics"],
            previewUrl:
              "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/cargo-operations.pdf",
            fileName: "cargo-operations.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 2870000,
          },
        ],
      },
    ],
  },
  {
    organizationName: "Harborfront Shopping Plaza",
    settings: {
      autoPublishUpdates: true,
      highResThumbnails: false,
      enableVersionControl: false,
      defaultGridSize: 15,
      defaultGridUnit: "m",
      defaultSnapToGrid: true,
      defaultShowGrid: true,
      defaultZoom: 135,
      defaultMapScale: "1:120",
      allowedFileTypes: ["pdf", "png", "jpg"],
      maxUploadSizeMb: 60,
      defaultLayerVisibility: {
        [MapLayerType.FLOOR_PLAN]: true,
        [MapLayerType.POI]: true,
        [MapLayerType.PATH]: true,
        [MapLayerType.ZONE]: true,
        [MapLayerType.LABEL]: true,
        [MapLayerType.ENTRANCE]: true,
        [MapLayerType.ELEVATOR]: true,
        [MapLayerType.RESTRICTED_ZONE]: false,
        [MapLayerType.TAG]: true,
        [MapLayerType.RULER]: false,
        [MapLayerType.MEASUREMENT]: false,
        [MapLayerType.ANNOTATION]: true,
        [MapLayerType.MESSAGE]: false,
        [MapLayerType.MEDIA]: true,
      },
      notificationPreferences: {
        publishSuccess: true,
        publishFailure: false,
        approvalRequired: false,
      },
      retentionPolicy: {
        keepDraftVersions: 5,
        keepPublishedSnapshots: 3,
      },
    },
    buildings: [
      {
        name: "Retail Pavilion",
        code: "HF-RET",
        description: "Flagship retail building with anchor stores and experiential zones.",
        tags: ["retail", "experiential"],
        address: {
          line1: "450 Market St",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "USA",
        },
        geoLocation: {
          latitude: 37.7936,
          longitude: -122.3957,
        },
        metadata: {
          anchorStores: 4,
          totalRetailUnits: 180,
          atriumHeightMeters: 22,
        },
        floors: [
          {
            name: "Atrium Level",
            code: "RP-L1",
            level: 1,
            sequence: 10,
            description: "High-street retail, flagship stores, interactive media walls.",
            tags: ["retail", "experiential"],
            isDefault: true,
          },
          {
            name: "Lifestyle Terrace",
            code: "RP-L2",
            level: 2,
            sequence: 20,
            description: "Boutique stores, cafes, green rooftop access.",
            tags: ["lifestyle", "food"],
          },
          {
            name: "Tech Commons",
            code: "RP-L3",
            level: 3,
            sequence: 30,
            description: "Technology pop-ups, AR experiences, co-working pods.",
            tags: ["tech"],
          },
        ],
        floorPlans: [
          {
            floorName: "Atrium Level",
            name: "Atrium Retail Grid",
            status: FloorPlanStatus.PUBLISHED,
            description: "Anchor store and experiential retail placement.",
            scale: "1:120",
            tags: ["retail", "experiential"],
            previewUrl:
              "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/atrium-retail.pdf",
            fileName: "atrium-retail.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 2540000,
          },
          {
            floorName: "Lifestyle Terrace",
            name: "Lifestyle Terrace",
            status: FloorPlanStatus.DRAFT,
            description: "Boutique stores, cafes, and green rooftop access.",
            scale: "1:140",
            tags: ["lifestyle", "food"],
            previewUrl:
              "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/lifestyle-terrace.pdf",
            fileName: "lifestyle-terrace.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 1960000,
          },
        ],
      },
      {
        name: "Harbor Conference Center",
        code: "HF-CONF",
        description: "Conference halls, event venues, and cinema multiplex.",
        tags: ["conference", "events", "cinema"],
        address: {
          line1: "460 Market St",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "USA",
        },
        geoLocation: {
          latitude: 37.7941,
          longitude: -122.395,
        },
        metadata: {
          cinemas: 8,
          ballroomCapacity: 1200,
          rooftopGarden: true,
        },
        floors: [
          {
            name: "Event Concourse",
            code: "HC-L1",
            level: 1,
            sequence: 10,
            description: "Main ballroom, breakout rooms, registration lobby.",
            tags: ["events", "ballroom"],
            isDefault: true,
          },
          {
            name: "Cinema Level",
            code: "HC-L2",
            level: 2,
            sequence: 20,
            description: "Dolby cinemas, VIP lounges, concession areas.",
            tags: ["cinema", "VIP"],
          },
          {
            name: "Service & Screening",
            code: "HC-B1",
            level: -1,
            sequence: 5,
            description: "Projection rooms, catering support, logistics dock.",
            tags: ["service"],
            isBasement: true,
          },
        ],
        floorPlans: [
          {
            floorName: "Event Concourse",
            name: "Conference Layout",
            status: FloorPlanStatus.PUBLISHED,
            description: "Ballroom configuration with breakout rooms.",
            scale: "1:180",
            tags: ["conference", "event"],
            previewUrl:
              "https://images.unsplash.com/photo-1542318428-29f26af1ff86?auto=format&fit=crop&w=900&q=80",
            fileUrl: "https://cdn.karepilot.dev/floor-plans/conference-layout.pdf",
            fileName: "conference-layout.pdf",
            mimeType: "application/pdf",
            fileSizeInBytes: 3150000,
          },
        ],
      },
    ],
  },
];

const seedPayloadLookup = new Map<string, MapManagerSeedPayload>();
mapManagerSeedData.forEach((payload) => {
  seedPayloadLookup.set(payload.organizationName.toLowerCase(), payload);
});

const createDefaultSeedPayload = (organizationName: string): MapManagerSeedPayload => ({
  organizationName,
  settings: {
    autoPublishUpdates: true,
    highResThumbnails: true,
    enableVersionControl: true,
    defaultGridSize: 20,
    defaultGridUnit: "px",
    defaultSnapToGrid: true,
    defaultShowGrid: true,
    defaultZoom: 125,
    defaultMapScale: "1:200",
    allowedFileTypes: ["pdf", "png", "jpg"],
    maxUploadSizeMb: 80,
    defaultLayerVisibility: {
      [MapLayerType.FLOOR_PLAN]: true,
      [MapLayerType.POI]: true,
      [MapLayerType.PATH]: true,
      [MapLayerType.ZONE]: true,
      [MapLayerType.LABEL]: true,
      [MapLayerType.ENTRANCE]: true,
      [MapLayerType.ELEVATOR]: true,
      [MapLayerType.RESTRICTED_ZONE]: false,
      [MapLayerType.TAG]: true,
      [MapLayerType.RULER]: false,
      [MapLayerType.MEASUREMENT]: false,
      [MapLayerType.ANNOTATION]: true,
      [MapLayerType.MESSAGE]: false,
      [MapLayerType.MEDIA]: true,
    },
    notificationPreferences: {
      publishSuccess: true,
      publishFailure: true,
      approvalRequired: false,
    },
    retentionPolicy: {
      keepDraftVersions: 5,
      keepPublishedSnapshots: 3,
    },
  },
  buildings: [
    {
      name: `${organizationName} Main Facility`,
      code: "MAIN-BLD",
      description: `Primary building for ${organizationName}`,
      tags: ["facility", "main"],
      metadata: {
        totalRooms: 120,
      },
      floors: [
        {
          name: "Ground Floor",
          code: "MAIN-G",
          level: 0,
          sequence: 0,
          description: "Reception, lobby, and visitor services.",
          tags: ["lobby", "services"],
          isDefault: true,
        },
        {
          name: "Level 1",
          code: "MAIN-L1",
          level: 1,
          sequence: 10,
          description: "Operational offices and meeting rooms.",
          tags: ["operations"],
        },
        {
          name: "Level 2",
          code: "MAIN-L2",
          level: 2,
          sequence: 20,
          description: "Support services and maintenance hub.",
          tags: ["support"],
        },
      ],
      floorPlans: [
        {
          floorName: "Ground Floor",
          name: "Ground Floor Overview",
          status: FloorPlanStatus.PUBLISHED,
          description: "Entrance, lobby, and security layout.",
          scale: "1:180",
          tags: ["lobby", "security"],
          previewUrl:
            "https://images.unsplash.com/photo-1529429617124-aee0a91b4174?auto=format&fit=crop&w=900&q=80",
          fileUrl: "https://cdn.karepilot.dev/floor-plans/ground-floor-overview.pdf",
          fileName: "ground-floor-overview.pdf",
          mimeType: "application/pdf",
          fileSizeInBytes: 2100000,
        },
        {
          floorName: "Level 1",
          name: "Level 1 Operations",
          status: FloorPlanStatus.DRAFT,
          description: "Operational offices and meeting rooms layout.",
          scale: "1:200",
          tags: ["operations"],
          previewUrl:
            "https://images.unsplash.com/photo-1529429617124-aee0a91b4174?auto=format&fit=crop&w=900&q=80",
          fileUrl: "https://cdn.karepilot.dev/floor-plans/level1-operations.pdf",
          fileName: "level1-operations.pdf",
          mimeType: "application/pdf",
          fileSizeInBytes: 1900000,
        },
      ],
    },
  ],
});

const seedMapManagerData = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await dbConnect();
    }

    const adminUser = await AdminUser.findOne({ role: AdminRole.ADMIN }).select("_id");
    const createdBy =
      adminUser && adminUser._id instanceof mongoose.Types.ObjectId ? adminUser._id : null;

    let buildingsCreated = 0;
    let buildingsUpdated = 0;
    let floorsCreated = 0;
    let floorsUpdated = 0;
    let floorPlansCreated = 0;
    let floorPlansUpdated = 0;
    let settingsUpserted = 0;

    const organizations = await Organization.find({}).select("_id name");

    for (const organization of organizations) {
      const organizationName = organization.name;
      const organizationId = new mongoose.Types.ObjectId(String(organization._id));

      const payload =
        seedPayloadLookup.get(organizationName.toLowerCase()) ??
        createDefaultSeedPayload(organizationName);

      const seedSettings = payload.settings ?? {};
      const defaultGridSize = seedSettings.defaultGridSize ?? 20;
      const defaultGridUnit = (seedSettings.defaultGridUnit as "px" | "ft" | "m") ?? "px";
      const defaultSnapToGrid = seedSettings.defaultSnapToGrid ?? true;
      const defaultShowGrid = seedSettings.defaultShowGrid ?? true;
      const defaultZoom = seedSettings.defaultZoom ?? 100;
      const autoPublishUpdates = seedSettings.autoPublishUpdates ?? false;
      const highResThumbnails = seedSettings.highResThumbnails ?? true;
      const enableVersionControl = seedSettings.enableVersionControl ?? true;
      const approvalRequired = seedSettings.notificationPreferences?.approvalRequired ?? false;

      for (const buildingData of payload.buildings) {
        let building = await MapBuilding.findOne({
          organization: organizationId,
          name: { $regex: new RegExp(`^${buildingData.name}$`, "i") },
        });

        if (!building) {
          building = await MapBuilding.create({
            organization: organizationId,
            name: buildingData.name,
            code: buildingData.code,
            description: buildingData.description,
            tags: buildingData.tags,
            address: buildingData.address,
            geoLocation: buildingData.geoLocation,
            metadata: buildingData.metadata,
            isActive: true,
            createdBy,
            updatedBy: createdBy,
          });
          console.log(`🏗️  Created building "${buildingData.name}" for ${payload.organizationName}`);
          buildingsCreated++;
        } else {
          building.description = buildingData.description;
          building.tags = buildingData.tags;
          building.address = buildingData.address ?? {};
          building.geoLocation = buildingData.geoLocation ?? {};
          building.metadata = buildingData.metadata ?? {};
          building.isActive = true;
          building.updatedBy = createdBy ?? building.updatedBy ?? null;
          await building.save();
          buildingsUpdated++;
        }

        const floorsData = buildingData.floors ?? [];
        let defaultFloorId: mongoose.Types.ObjectId | null =
          building.defaultFloor instanceof mongoose.Types.ObjectId
            ? building.defaultFloor
            : null;

        for (const floorData of floorsData) {
          let floor = await MapFloor.findOne({
            organization: organizationId,
            building: building._id,
            name: { $regex: new RegExp(`^${floorData.name}$`, "i") },
          });

          if (!floor) {
            floor = await MapFloor.create({
              organization: organizationId,
              building: building._id,
              name: floorData.name,
              code: floorData.code,
              level: floorData.level,
              sequence: floorData.sequence,
              description: floorData.description,
              isBasement: floorData.isBasement ?? false,
              isDefault: floorData.isDefault ?? false,
              tags: floorData.tags ?? [],
              attributes: floorData.attributes,
              isActive: true,
              createdBy,
              updatedBy: createdBy,
            });
            floorsCreated++;
          } else {
            floor.code = floorData.code;
            floor.level = floorData.level;
            floor.sequence = floorData.sequence;
            floor.description = floorData.description;
            floor.isBasement = floorData.isBasement ?? false;
            floor.isDefault = floorData.isDefault ?? false;
            floor.tags = floorData.tags ?? [];
            floor.attributes = floorData.attributes ?? {};
            floor.isActive = true;
            floor.updatedBy = createdBy ?? floor.updatedBy ?? null;
            await floor.save();
            floorsUpdated++;
          }

          if (floorData.isDefault) {
            defaultFloorId = new mongoose.Types.ObjectId(String(floor._id));
          }
        }

        const activeFloorCount = await MapFloor.countDocuments({
          organization: organizationId,
          building: building._id,
          isActive: true,
        });

        if (defaultFloorId) {
          await MapFloor.updateMany(
            {
              organization: organizationId,
              building: building._id,
              _id: { $ne: defaultFloorId },
            },
            { $set: { isDefault: false } },
          );
        }

        building.floorCount = activeFloorCount;
        building.defaultFloor = defaultFloorId;
        building.updatedBy = createdBy ?? building.updatedBy ?? null;
        await building.save();

        const floorDocs = await MapFloor.find({
          organization: organizationId,
          building: building._id,
        });

        const floorMap = new Map<string, mongoose.Types.ObjectId>();
        floorDocs.forEach((floor) => {
          floorMap.set(floor.name.toLowerCase(), floor._id as mongoose.Types.ObjectId);
        });

        const floorPlansData = buildingData.floorPlans ?? [];
        for (const floorPlanData of floorPlansData) {
          const targetFloorId = floorMap.get(floorPlanData.floorName.toLowerCase());
          if (!targetFloorId) {
            console.warn(
              `⚠️  Floor "${floorPlanData.floorName}" not found for building "${buildingData.name}" while creating floor plan "${floorPlanData.name}".`,
            );
            continue;
          }

          const fileMetadata: IFloorPlanFileMetadata | undefined = floorPlanData.fileName
            ? (() => {
                const metadata: IFloorPlanFileMetadata = {
                  storageKey: `${buildingData.code}/${floorPlanData.fileName}`,
                  fileName: floorPlanData.fileName,
                  originalName: floorPlanData.fileName,
                  mimeType: floorPlanData.mimeType ?? "application/pdf",
                  fileSizeInBytes: floorPlanData.fileSizeInBytes ?? 2_000_000,
                  uploadedAt: new Date(),
                };
                if (floorPlanData.fileUrl) {
                  metadata.url = floorPlanData.fileUrl;
                }
                return metadata;
              })()
            : undefined;

          const previewMetadata: IFloorPlanPreview | undefined = floorPlanData.previewUrl
            ? {
                url: floorPlanData.previewUrl,
                generatedAt: new Date(),
              }
            : undefined;

          let floorPlan = await FloorPlan.findOne({
            organization: organizationId,
            building: building._id,
            floor: targetFloorId,
            name: { $regex: new RegExp(`^${floorPlanData.name}$`, "i") },
          });

          if (!floorPlan) {
            const createPayload: any = {
              organization: organizationId,
              building: building._id,
              floor: targetFloorId,
              name: floorPlanData.name,
              status: floorPlanData.status ?? FloorPlanStatus.DRAFT,
              tags: floorPlanData.tags ?? [],
              stats: {
                poiCount: 0,
                pathCount: 0,
                zoneCount: 0,
                labelCount: 0,
                entranceCount: 0,
                elevatorCount: 0,
                restrictedZoneCount: 0,
                annotationCount: 0,
                draftElementCount: 0,
              },
              settings: {
                gridSize: defaultGridSize,
                gridUnit: defaultGridUnit,
                snapToGrid: defaultSnapToGrid,
                showGrid: defaultShowGrid,
                defaultZoom,
                autoPublish: autoPublishUpdates,
                highResThumbnails,
                versionControl: enableVersionControl,
              },
              versionNumber: 1,
              currentVersion: null,
              publishedVersion: null,
              lastPublishedAt:
                floorPlanData.status === FloorPlanStatus.PUBLISHED ? new Date() : null,
              publishOptions: {
                autoPublish: autoPublishUpdates,
                requireApproval: approvalRequired,
              },
              isLocked: false,
              createdBy,
              updatedBy: createdBy,
            };

            if (fileMetadata) {
              createPayload.file = fileMetadata;
            }

            if (previewMetadata) {
              createPayload.preview = previewMetadata;
            }

            if (floorPlanData.description !== undefined) {
              createPayload.description = floorPlanData.description;
            }

            if (floorPlanData.scale !== undefined) {
              createPayload.scale = floorPlanData.scale;
            }

            await FloorPlan.create(createPayload);
            floorPlansCreated++;
          } else {
            if (floorPlanData.status) {
              floorPlan.status = floorPlanData.status;
            }

            if (floorPlanData.description !== undefined) {
              floorPlan.description = floorPlanData.description;
            }

            if (floorPlanData.scale !== undefined) {
              floorPlan.scale = floorPlanData.scale;
            }

            if (floorPlanData.tags !== undefined) {
              floorPlan.tags = floorPlanData.tags;
            }

            if (fileMetadata) {
              floorPlan.file = fileMetadata as any;
            }

            if (previewMetadata) {
              floorPlan.preview = previewMetadata as any;
            }

            floorPlan.updatedBy = createdBy ?? floorPlan.updatedBy ?? null;
            if (floorPlan.status === FloorPlanStatus.PUBLISHED && !floorPlan.lastPublishedAt) {
              floorPlan.lastPublishedAt = new Date();
            }
            await floorPlan.save();
            floorPlansUpdated++;
          }
        }
      }

      if (payload.settings) {
        await MapManagerSettings.findOneAndUpdate(
          { organization: organizationId },
          {
            $set: {
              ...payload.settings,
              organization: organizationId,
              updatedBy: createdBy ?? undefined,
            },
            $setOnInsert: {
              createdBy: createdBy ?? undefined,
            },
          },
          { upsert: true, new: true },
        );
        settingsUpserted++;
      }
    }

    console.log("\n📊 Map Manager Seeding Summary:");
    console.log(`   ✅ Buildings created: ${buildingsCreated}`);
    console.log(`   🔄 Buildings updated: ${buildingsUpdated}`);
    console.log(`   ✅ Floors created: ${floorsCreated}`);
    console.log(`   🔄 Floors updated: ${floorsUpdated}`);
    console.log(`   🗺️  Floor plans created: ${floorPlansCreated}`);
    console.log(`   🔄 Floor plans updated: ${floorPlansUpdated}`);
    console.log(`   ⚙️  Settings upserted: ${settingsUpserted}`);
  } catch (error: any) {
    console.error("❌ Error seeding map manager data:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedMapManagerData()
    .then(() => {
      console.log("\n✅ Map Manager seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Map Manager seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedMapManagerData;


