import Joi from 'joi';
import { OrganizationType } from '../../../models/admin/organization/organization';

export const createOrganizationSchema = Joi.object({
  organizationType: Joi.string()
    .valid(...Object.values(OrganizationType))
    .required()
    .messages({
      'any.only': `Organization type must be one of: ${Object.values(OrganizationType).join(', ')}`,
      'any.required': 'Organization type is required'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Organization name must be at least 2 characters long',
      'string.max': 'Organization name cannot exceed 100 characters',
      'any.required': 'Organization name is required'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  phone: Joi.string()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Phone must be a string'
    }),
  country: Joi.string()
    .max(100)
    .trim()
    .required()
    .messages({
      'string.max': 'Country cannot exceed 100 characters',
      'any.required': 'Country is required'
    }),
  city: Joi.string()
    .max(100)
    .trim()
    .required()
    .messages({
      'string.max': 'City cannot exceed 100 characters',
      'any.required': 'City is required'
    }),
  timezone: Joi.string()
    .max(100)
    .trim()
    .required()
    .messages({
      'string.max': 'Timezone cannot exceed 100 characters',
      'any.required': 'Timezone is required'
    }),
  address: Joi.string()
    .max(500)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
  venueTemplate: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid venue template ID format',
      'any.required': 'Venue template is required'
    }),
  isActive: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'isActive must be a boolean'
    })
});

export const updateOrganizationSchema = Joi.object({
  organizationType: Joi.string()
    .valid(...Object.values(OrganizationType))
    .optional()
    .messages({
      'any.only': `Organization type must be one of: ${Object.values(OrganizationType).join(', ')}`
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Organization name must be at least 2 characters long',
      'string.max': 'Organization name cannot exceed 100 characters'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Phone must be a string'
    }),
  country: Joi.string()
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.max': 'Country cannot exceed 100 characters'
    }),
  city: Joi.string()
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.max': 'City cannot exceed 100 characters'
    }),
  timezone: Joi.string()
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.max': 'Timezone cannot exceed 100 characters'
    }),
  address: Joi.string()
    .max(500)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
  venueTemplate: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid venue template ID format'
    }),
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive must be a boolean'
    })
});

export const organizationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional(),
  name: Joi.string().trim().optional(),
  organizationType: Joi.string()
    .valid(...Object.values(OrganizationType))
    .optional()
    .messages({
      'any.only': `Organization type must be one of: ${Object.values(OrganizationType).join(', ')}`
    }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean'
  })
});

export const organizationIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid organization ID format'
  })
});

