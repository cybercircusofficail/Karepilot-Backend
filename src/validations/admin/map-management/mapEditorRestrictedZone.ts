import Joi from "joi";

const RestrictionType = Joi.string().valid(
  "Staff Only",
  "Authorized Personnel",
  "Emergency Access Only",
);

const coordinatesSchema = Joi.object({
  x: Joi.number().required().messages({
    "any.required": "X coordinate is required",
    "number.base": "X coordinate must be a number",
  }),
  y: Joi.number().required().messages({
    "any.required": "Y coordinate is required",
    "number.base": "Y coordinate must be a number",
  }),
  width: Joi.number()
    .min(1)
    .required()
    .messages({
      "any.required": "Width is required",
      "number.base": "Width must be a number",
      "number.min": "Width must be at least 1",
    }),
  height: Joi.number()
    .min(1)
    .required()
    .messages({
      "any.required": "Height is required",
      "number.base": "Height must be a number",
      "number.min": "Height must be at least 1",
    }),
});

export const createMapEditorRestrictedZoneSchema = Joi.object({
  floorPlanId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Floor plan ID is required",
      "string.pattern.base": "Invalid floor plan ID format",
    }),
  name: Joi.string()
    .min(2)
    .max(150)
    .trim()
    .required()
    .messages({
      "any.required": "Restricted zone name is required",
      "string.min": "Restricted zone name must be at least 2 characters long",
      "string.max": "Restricted zone name cannot exceed 150 characters",
    }),
  description: Joi.string()
    .max(1000)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Description cannot exceed 1000 characters",
    }),
  restrictionType: RestrictionType.required().messages({
    "any.required": "Restriction type is required",
    "any.only": "Restriction type must be one of: Staff Only, Authorized Personnel, Emergency Access Only",
  }),
  coordinates: coordinatesSchema.required().messages({
    "any.required": "Coordinates are required",
  }),
  color: Joi.string()
    .max(20)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Color cannot exceed 20 characters",
    }),
});

export const updateMapEditorRestrictedZoneSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(150)
    .trim()
    .optional()
    .messages({
      "string.min": "Restricted zone name must be at least 2 characters long",
      "string.max": "Restricted zone name cannot exceed 150 characters",
    }),
  description: Joi.string()
    .max(1000)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Description cannot exceed 1000 characters",
    }),
  restrictionType: RestrictionType.optional().messages({
    "any.only": "Restriction type must be one of: Staff Only, Authorized Personnel, Emergency Access Only",
  }),
  coordinates: coordinatesSchema.optional(),
  color: Joi.string()
    .max(20)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Color cannot exceed 20 characters",
    }),
  isActive: Joi.boolean().optional(),
});

