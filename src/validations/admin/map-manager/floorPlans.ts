import Joi from "joi";
import { FloorPlanStatus } from "../../../models/admin/map-manager/enums";

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const floorPlanStatusValues = Object.values(FloorPlanStatus);

const fileSchema = Joi.object({
  fileName: Joi.string().trim().required(),
  mimeType: Joi.string().trim().required(),
  fileSizeInBytes: Joi.number().integer().min(0).required(),
  url: Joi.string().uri().optional(),
});

export const createFloorPlanSchema = Joi.object({
  organization: objectId.required(),
  building: objectId.required(),
  floor: objectId.required(),
  name: Joi.string().min(2).max(180).trim().required(),
  status: Joi.string()
    .valid(...floorPlanStatusValues)
    .optional(),
  description: Joi.string().max(2000).optional(),
  scale: Joi.string().max(50).optional(),
  tags: Joi.array().items(Joi.string().trim().min(1)).optional(),
  file: fileSchema.optional().allow(null),
  previewUrl: Joi.string().uri().optional(),
});

export const updateFloorPlanSchema = Joi.object({
  name: Joi.string().min(2).max(180).trim().optional(),
  status: Joi.string()
    .valid(...floorPlanStatusValues)
    .optional(),
  description: Joi.string().max(2000).optional().allow(null),
  scale: Joi.string().max(50).optional().allow(null),
  tags: Joi.array().items(Joi.string().trim().min(1)).optional(),
  file: fileSchema.optional().allow(null),
  previewUrl: Joi.string().uri().optional().allow(null),
}).min(1);

export const floorPlanIdParamSchema = Joi.object({
  id: objectId.required(),
});

export const floorPlanQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  organization: objectId.optional(),
  building: objectId.optional(),
  floor: objectId.optional(),
  status: Joi.string()
    .valid(...floorPlanStatusValues)
    .optional(),
  search: Joi.string().trim().optional(),
  tag: Joi.string().trim().optional(),
});


