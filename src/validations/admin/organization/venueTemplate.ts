import Joi from 'joi';

export const createVenueTemplateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Venue template name must be at least 2 characters long',
      'string.max': 'Venue template name cannot exceed 100 characters',
      'any.required': 'Venue template name is required'
    }),
  description: Joi.string()
    .max(500)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  includedFeatures: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .default([])
    .messages({
      'array.base': 'Included features must be an array',
      'string.min': 'Each included feature must be at least 1 character long'
    }),
  defaultPOICategories: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .default([])
    .messages({
      'array.base': 'Default POI categories must be an array',
      'string.min': 'Each POI category must be at least 1 character long'
    })
});

export const updateVenueTemplateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Venue template name must be at least 2 characters long',
      'string.max': 'Venue template name cannot exceed 100 characters'
    }),
  description: Joi.string()
    .max(500)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  includedFeatures: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .messages({
      'array.base': 'Included features must be an array',
      'string.min': 'Each included feature must be at least 1 character long'
    }),
  defaultPOICategories: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .messages({
      'array.base': 'Default POI categories must be an array',
      'string.min': 'Each POI category must be at least 1 character long'
    })
});

export const venueTemplateQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional(),
  name: Joi.string().trim().optional()
});

export const venueTemplateIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid venue template ID format'
  })
});

