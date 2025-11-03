import Joi from 'joi';
import { AdminRole, UserStatus } from '../../../models/admin/user-management';

const roleSchema = Joi.string()
  .valid(...Object.values(AdminRole))
  .optional()
  .messages({
    'any.only': 'Invalid role specified. Must be one of: Admin, Manager, Technician, Staff, Security, Viewer'
  });

const statusSchema = Joi.string()
  .valid(...Object.values(UserStatus))
  .optional()
  .messages({
    'any.only': 'Invalid status specified. Must be one of: active, pending, inactive'
  });

export const createUserSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  role: roleSchema.default(AdminRole.VIEWER),
  department: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .custom((value, helpers) => {
      const role = helpers.state.ancestors[0]?.role;
      if (role === AdminRole.ADMIN && value) {
        return helpers.error('any.custom', {
          message: 'Admin role cannot be assigned to a department',
        });
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'Invalid department ID format',
      'any.custom': 'Admin role cannot be assigned to a department',
    }),
  phoneNumber: Joi.string().trim().optional(),
  badgeNumber: Joi.string().trim().optional(),
  shift: Joi.string().trim().optional(),
  currentLocation: Joi.string().trim().optional(),
  status: statusSchema
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string()
    .min(6)
    .optional()
    .messages({
      'string.min': 'Password must be at least 6 characters long'
    }),
  role: roleSchema,
  department: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .custom((value, helpers) => {
      const role = helpers.state.ancestors[0]?.role;
      if (role === AdminRole.ADMIN && value) {
        return helpers.error('any.custom', {
          message: 'Admin role cannot be assigned to a department',
        });
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'Invalid department ID format',
      'any.custom': 'Admin role cannot be assigned to a department',
    }),
  phoneNumber: Joi.string().trim().optional(),
  badgeNumber: Joi.string().trim().optional(),
  shift: Joi.string().trim().optional(),
  profileImage: Joi.string().trim().optional(),
  isActive: Joi.boolean().optional(),
  currentLocation: Joi.string().trim().optional(),
  status: statusSchema
});

export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  role: roleSchema,
  department: Joi.string().trim().optional(),
  search: Joi.string().trim().optional(),
  isActive: Joi.boolean().optional(),
  status: statusSchema
});

export const userIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid user ID format'
  })
});

