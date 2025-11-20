"use strict";

import Joi from "joi";

const coordinatesSchema = Joi.object({
  x: Joi.number().required().min(0).messages({
    "number.base": "X coordinate must be a number",
    "number.min": "X coordinate must be at least 0",
    "any.required": "X coordinate is required",
  }),
  y: Joi.number().required().min(0).messages({
    "number.base": "Y coordinate must be a number",
    "number.min": "Y coordinate must be at least 0",
    "any.required": "Y coordinate is required",
  }),
});

export const createMapEditorElevatorSchema = Joi.object({
  floorPlanId: Joi.string().required().messages({
    "string.empty": "Floor plan ID is required",
    "any.required": "Floor plan ID is required",
  }),
  name: Joi.string().required().min(2).max(150).trim().messages({
    "string.empty": "Elevator name is required",
    "string.min": "Elevator name must be at least 2 characters long",
    "string.max": "Elevator name cannot exceed 150 characters",
    "any.required": "Elevator name is required",
  }),
  description: Joi.string().max(1000).trim().allow("").optional().messages({
    "string.max": "Description cannot exceed 1000 characters",
  }),
  coordinates: coordinatesSchema.required().messages({
    "any.required": "Coordinates are required",
  }),
  connectsToFloors: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.base": "Connected floors must be an array",
    "array.min": "At least one floor connection is required",
    "any.required": "Connected floors are required",
  }),
  icon: Joi.string().max(50).trim().allow("").optional().messages({
    "string.max": "Icon cannot exceed 50 characters",
  }),
  color: Joi.string().max(20).trim().allow("").optional().messages({
    "string.max": "Color cannot exceed 20 characters",
  }),
  isAccessible: Joi.boolean().optional().messages({
    "boolean.base": "Accessible flag must be a boolean",
  }),
});

export const updateMapEditorElevatorSchema = Joi.object({
  name: Joi.string().min(2).max(150).trim().optional().messages({
    "string.min": "Elevator name must be at least 2 characters long",
    "string.max": "Elevator name cannot exceed 150 characters",
  }),
  description: Joi.string().max(1000).trim().allow("").optional().messages({
    "string.max": "Description cannot exceed 1000 characters",
  }),
  coordinates: coordinatesSchema.optional(),
  connectsToFloors: Joi.array().items(Joi.string()).min(1).optional().messages({
    "array.base": "Connected floors must be an array",
    "array.min": "At least one floor connection is required",
  }),
  icon: Joi.string().max(50).trim().allow("").optional().messages({
    "string.max": "Icon cannot exceed 50 characters",
  }),
  color: Joi.string().max(20).trim().allow("").optional().messages({
    "string.max": "Color cannot exceed 20 characters",
  }),
  isAccessible: Joi.boolean().optional().messages({
    "boolean.base": "Accessible flag must be a boolean",
  }),
  isActive: Joi.boolean().optional().messages({
    "boolean.base": "Active flag must be a boolean",
  }),
}).min(1);
