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

export const createMapEditorEntranceSchema = Joi.object({
  floorPlanId: Joi.string().required().messages({
    "any.required": "Floor plan ID is required",
    "string.empty": "Floor plan ID cannot be empty",
  }),
  name: Joi.string().trim().min(2).max(150).required().messages({
    "any.required": "Entrance name is required",
    "string.empty": "Entrance name cannot be empty",
    "string.min": "Entrance name must be at least 2 characters long",
    "string.max": "Entrance name cannot exceed 150 characters",
  }),
  category: Joi.string().trim().max(120).required().messages({
    "any.required": "Category is required",
    "string.empty": "Category cannot be empty",
    "string.max": "Category cannot exceed 120 characters",
  }),
  description: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "Description cannot exceed 1000 characters",
  }),
  coordinates: coordinatesSchema.required().messages({
    "any.required": "Coordinates are required",
  }),
  icon: Joi.string().trim().max(50).allow("", null).optional().messages({
    "string.max": "Icon cannot exceed 50 characters",
  }),
  color: Joi.string().trim().max(20).allow("", null).optional().messages({
    "string.max": "Color cannot exceed 20 characters",
  }),
  isAccessible: Joi.boolean().optional(),
});

export const updateMapEditorEntranceSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional().messages({
    "string.empty": "Entrance name cannot be empty",
    "string.min": "Entrance name must be at least 2 characters long",
    "string.max": "Entrance name cannot exceed 150 characters",
  }),
  category: Joi.string().trim().max(120).optional().messages({
    "string.empty": "Category cannot be empty",
    "string.max": "Category cannot exceed 120 characters",
  }),
  description: Joi.string().trim().max(1000).allow("", null).optional().messages({
    "string.max": "Description cannot exceed 1000 characters",
  }),
  coordinates: coordinatesSchema.optional(),
  icon: Joi.string().trim().max(50).allow("", null).optional().messages({
    "string.max": "Icon cannot exceed 50 characters",
  }),
  color: Joi.string().trim().max(20).allow("", null).optional().messages({
    "string.max": "Color cannot exceed 20 characters",
  }),
  isAccessible: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

