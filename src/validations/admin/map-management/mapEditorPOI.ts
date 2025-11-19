import Joi from "joi";

const coordinatesSchema = Joi.object({
  x: Joi.number().required().messages({
    "any.required": "X coordinate is required",
    "number.base": "X coordinate must be a number",
  }),
  y: Joi.number().required().messages({
    "any.required": "Y coordinate is required",
    "number.base": "Y coordinate must be a number",
  }),
});

export const createMapEditorPOISchema = Joi.object({
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
      "any.required": "POI name is required",
      "string.min": "POI name must be at least 2 characters long",
      "string.max": "POI name cannot exceed 150 characters",
    }),
  category: Joi.string()
    .max(120)
    .trim()
    .required()
    .messages({
      "any.required": "Category is required",
      "string.max": "Category cannot exceed 120 characters",
    }),
  description: Joi.string()
    .max(1000)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Description cannot exceed 1000 characters",
    }),
  coordinates: coordinatesSchema.required().messages({
    "any.required": "Coordinates are required",
  }),
  icon: Joi.string()
    .max(50)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Icon cannot exceed 50 characters",
    }),
  color: Joi.string()
    .max(20)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Color cannot exceed 20 characters",
    }),
  isAccessible: Joi.boolean().optional().default(true),
});

export const updateMapEditorPOISchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(150)
    .trim()
    .optional()
    .messages({
      "string.min": "POI name must be at least 2 characters long",
      "string.max": "POI name cannot exceed 150 characters",
    }),
  category: Joi.string()
    .max(120)
    .trim()
    .optional()
    .messages({
      "string.max": "Category cannot exceed 120 characters",
    }),
  description: Joi.string()
    .max(1000)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Description cannot exceed 1000 characters",
    }),
  coordinates: coordinatesSchema.optional(),
  icon: Joi.string()
    .max(50)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Icon cannot exceed 50 characters",
    }),
  color: Joi.string()
    .max(20)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Color cannot exceed 20 characters",
    }),
  isAccessible: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

