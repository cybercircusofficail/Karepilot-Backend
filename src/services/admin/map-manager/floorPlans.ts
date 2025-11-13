import { FilterQuery, Types } from "mongoose";
import httpStatus from "http-status";
import FloorPlan, {
  IFloorPlan,
  IFloorPlanFileMetadata,
  IFloorPlanPreview,
} from "../../../models/admin/map-manager/floorPlan";
import MapFloor from "../../../models/admin/map-manager/mapFloor";
import MapBuilding from "../../../models/admin/map-manager/mapBuilding";
import {
  CreateFloorPlanDTO,
  UpdateFloorPlanDTO,
  FloorPlanQuery,
  FloorPlanStats,
} from "../../../types/admin/map-manager";
import { FloorPlanStatus } from "../../../models/admin/map-manager/enums";
import { buildPaginationMeta, getPaginationParams } from "../../../utils";

type LeanFloorPlan = IFloorPlan & { _id: Types.ObjectId };

const buildFilters = (query: FloorPlanQuery): FilterQuery<IFloorPlan> => {
  const filters: FilterQuery<IFloorPlan> = {};

  if (query.organization) {
    filters.organization = new Types.ObjectId(query.organization);
  }

  if (query.building) {
    filters.building = new Types.ObjectId(query.building);
  }

  if (query.floor) {
    filters.floor = new Types.ObjectId(query.floor);
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.search) {
    const regex = new RegExp(query.search.trim(), "i");
    filters.$or = [{ name: regex }, { description: regex }, { tags: regex }];
  }

  if (query.tag) {
    filters.tags = query.tag;
  }

  return filters;
};

export const mapManagerFloorPlanService = {
  async getFloorPlans(query: FloorPlanQuery) {
    const filters = buildFilters(query);
    const paginationOptions: { page?: number; limit?: number } = {};

    if (typeof query.page === "number") {
      paginationOptions.page = query.page;
    }

    if (typeof query.limit === "number") {
      paginationOptions.limit = query.limit;
    }

    const { page, limit, skip } = getPaginationParams(paginationOptions);

    const [floorPlans, total] = await Promise.all([
      FloorPlan.find(filters)
        .populate("building", "name code")
        .populate("floor", "name code level")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<LeanFloorPlan[]>(),
      FloorPlan.countDocuments(filters),
    ]);

    const pagination = buildPaginationMeta(total, page, limit);

    return { floorPlans, pagination };
  },

  async getFloorPlanById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw Object.assign(new Error("Invalid floor plan id"), {
        statusCode: httpStatus.BAD_REQUEST,
      });
    }

    const floorPlan = await FloorPlan.findById(id)
      .populate("building", "name code")
      .populate("floor", "name code level")
      .lean<LeanFloorPlan | null>();

    if (!floorPlan) {
      throw Object.assign(new Error("Floor plan not found"), {
        statusCode: httpStatus.NOT_FOUND,
      });
    }

    return floorPlan;
  },

  async createFloorPlan(payload: CreateFloorPlanDTO, creatorId?: string) {
    const organizationId = new Types.ObjectId(payload.organization);
    const buildingId = new Types.ObjectId(payload.building);
    const floorId = new Types.ObjectId(payload.floor);

    const floor = await MapFloor.findOne({
      _id: floorId,
      organization: organizationId,
      building: buildingId,
    });

    if (!floor) {
      throw Object.assign(new Error("Floor not found for the specified organization/building"), {
        statusCode: httpStatus.BAD_REQUEST,
      });
    }

    const existingFloorPlan = await FloorPlan.findOne({
      organization: organizationId,
      building: buildingId,
      floor: floorId,
      name: payload.name.trim(),
    });

    if (existingFloorPlan) {
      throw Object.assign(new Error("Floor plan with the same name already exists for this floor"), {
        statusCode: httpStatus.CONFLICT,
      });
    }

    const fileMeta: IFloorPlanFileMetadata | undefined = payload.file
      ? (() => {
          const metadata: IFloorPlanFileMetadata = {
            storageKey: `${payload.building}/${payload.file.fileName}`,
            fileName: payload.file.fileName,
            originalName: payload.file.fileName,
            mimeType: payload.file.mimeType,
            fileSizeInBytes: payload.file.fileSizeInBytes,
            uploadedAt: new Date(),
          };
          if (payload.file.url) {
            metadata.url = payload.file.url;
          }
          return metadata;
        })()
      : undefined;

    const preview: IFloorPlanPreview | undefined = payload.previewUrl
      ? {
          url: payload.previewUrl,
          generatedAt: new Date(),
        }
      : undefined;

    const floorPlan = await FloorPlan.create({
      organization: organizationId,
      building: buildingId,
      floor: floorId,
      name: payload.name.trim(),
      status: payload.status ?? FloorPlanStatus.DRAFT,
      description: payload.description,
      scale: payload.scale,
      tags: payload.tags ?? [],
      ...(fileMeta ? { file: fileMeta } : {}),
      ...(preview ? { preview } : {}),
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
        gridSize: 20,
        gridUnit: "px",
        snapToGrid: true,
        showGrid: true,
        defaultZoom: 100,
        autoPublish: false,
        highResThumbnails: true,
        versionControl: true,
      },
      versionNumber: 1,
      currentVersion: null,
      publishedVersion: null,
      lastPublishedAt:
        payload.status === FloorPlanStatus.PUBLISHED ? new Date() : null,
      publishOptions: {
        autoPublish: false,
        requireApproval: false,
      },
      isLocked: false,
      createdBy: creatorId ? new Types.ObjectId(creatorId) : null,
      updatedBy: creatorId ? new Types.ObjectId(creatorId) : null,
    });

    return floorPlan.toObject();
  },

  async updateFloorPlan(id: string, payload: UpdateFloorPlanDTO, updaterId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw Object.assign(new Error("Invalid floor plan id"), {
        statusCode: httpStatus.BAD_REQUEST,
      });
    }

    const floorPlan = await FloorPlan.findById(id);

    if (!floorPlan) {
      throw Object.assign(new Error("Floor plan not found"), {
        statusCode: httpStatus.NOT_FOUND,
      });
    }

    if (payload.name) {
      floorPlan.name = payload.name.trim();
    }

    if (payload.status) {
      floorPlan.status = payload.status;
      if (payload.status === FloorPlanStatus.PUBLISHED) {
        floorPlan.lastPublishedAt = new Date();
      }
    }

    if (payload.description !== undefined) {
      floorPlan.description = payload.description;
    }

    if (payload.scale !== undefined) {
      floorPlan.scale = payload.scale;
    }

    if (payload.tags) {
      floorPlan.tags = payload.tags;
    }

    if (payload.file === null) {
      floorPlan.set("file", undefined);
    } else if (payload.file) {
      const newFile: IFloorPlanFileMetadata = {
        storageKey: `${floorPlan.building}/${payload.file.fileName}`,
        fileName: payload.file.fileName,
        originalName: payload.file.fileName,
        mimeType: payload.file.mimeType,
        fileSizeInBytes: payload.file.fileSizeInBytes,
        uploadedAt: new Date(),
      };
      if (payload.file.url) {
        newFile.url = payload.file.url;
      }
      floorPlan.file = newFile;
    }

    if (payload.previewUrl === null) {
      floorPlan.set("preview", undefined);
    } else if (payload.previewUrl) {
      floorPlan.preview = {
        url: payload.previewUrl,
        generatedAt: new Date(),
      };
    }

    if (updaterId) {
      floorPlan.updatedBy = new Types.ObjectId(updaterId);
    }

    await floorPlan.save();

    return floorPlan.toObject();
  },

  async deleteFloorPlan(id: string, updaterId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw Object.assign(new Error("Invalid floor plan id"), {
        statusCode: httpStatus.BAD_REQUEST,
      });
    }

    const floorPlan = await FloorPlan.findById(id);

    if (!floorPlan) {
      throw Object.assign(new Error("Floor plan not found"), {
        statusCode: httpStatus.NOT_FOUND,
      });
    }

    floorPlan.status = FloorPlanStatus.ARCHIVED;
    floorPlan.isLocked = false;
    if (updaterId) {
      floorPlan.updatedBy = new Types.ObjectId(updaterId);
    }
    await floorPlan.save();

    return floorPlan.toObject();
  },

  async getFloorPlanStats(query: FloorPlanQuery = {}): Promise<FloorPlanStats> {
    const filters = buildFilters(query);

    const [total, published, draft, inProgress, archived] = await Promise.all([
      FloorPlan.countDocuments(filters),
      FloorPlan.countDocuments({ ...filters, status: FloorPlanStatus.PUBLISHED }),
      FloorPlan.countDocuments({ ...filters, status: FloorPlanStatus.DRAFT }),
      FloorPlan.countDocuments({ ...filters, status: FloorPlanStatus.IN_PROGRESS }),
      FloorPlan.countDocuments({ ...filters, status: FloorPlanStatus.ARCHIVED }),
    ]);

    return {
      total,
      published,
      draft,
      inProgress,
      archived,
    };
  },
};

export type MapManagerFloorPlanService = typeof mapManagerFloorPlanService;


