import Joi from "joi";

const pointSchema = Joi.object({
  x: Joi.number().required().messages({
    "any.required": "X coordinate is required",
    "number.base": "X coordinate must be a number",
  }),
  y: Joi.number().required().messages({
    "any.required": "Y coordinate is required",
    "number.base": "Y coordinate must be a number",
  }),
});

export const createMapEditorMeasurementSchema = Joi.object({
  floorPlanId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Floor plan ID is required",
      "string.pattern.base": "Invalid floor plan ID format",
    }),
  startPoint: pointSchema.required().messages({
    "any.required": "Start point is required",
  }),
  endPoint: pointSchema.required().messages({
    "any.required": "End point is required",
  }),
  distance: Joi.number()
    .min(0)
    .required()
    .messages({
      "any.required": "Distance is required",
      "number.min": "Distance must be a positive number",
    }),
  unit: Joi.string()
    .max(20)
    .trim()
    .required()
    .messages({
      "any.required": "Unit is required",
      "string.max": "Unit cannot exceed 20 characters",
    }),
  color: Joi.string()
    .max(20)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Color cannot exceed 20 characters",
    }),
  strokeWidth: Joi.number()
    .min(1)
    .max(20)
    .optional()
    .messages({
      "number.min": "Stroke width must be at least 1",
      "number.max": "Stroke width cannot exceed 20",
    }),
});

export const updateMapEditorMeasurementSchema = Joi.object({
  startPoint: pointSchema.optional(),
  endPoint: pointSchema.optional(),
  distance: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.min": "Distance must be a positive number",
    }),
  unit: Joi.string()
    .max(20)
    .trim()
    .optional()
    .messages({
      "string.max": "Unit cannot exceed 20 characters",
    }),
  color: Joi.string()
    .max(20)
    .trim()
    .allow("", null)
    .optional()
    .messages({
      "string.max": "Color cannot exceed 20 characters",
    }),
  strokeWidth: Joi.number()
    .min(1)
    .max(20)
    .optional()
    .messages({
      "number.min": "Stroke width must be at least 1",
      "number.max": "Stroke width cannot exceed 20",
    }),
  isActive: Joi.boolean().optional(),
});

