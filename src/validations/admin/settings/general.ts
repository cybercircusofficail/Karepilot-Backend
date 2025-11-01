import Joi from 'joi';


export const adminProfileUpdateSchema = Joi.object({
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
  
  profileImage: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Profile image must be a valid URL'
    })
});

export const adminPreferencesUpdateSchema = Joi.object({
  theme: Joi.string()
    .valid('light', 'dark', 'system')
    .required()
    .messages({
      'any.only': 'Theme must be one of: light, dark, system',
      'any.required': 'Theme is required'
    }),
  
  language: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Language must be a string',
      'any.required': 'Language is required'
    }),
  
  timezone: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Timezone must be a string',
      'any.required': 'Timezone is required'
    }),
  
  dateFormat: Joi.string()
    .valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')
    .required()
    .messages({
      'any.only': 'Date format must be one of: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD',
      'any.required': 'Date format is required'
    }),
  
  timeFormat: Joi.string()
    .valid('12', '24')
    .required()
    .messages({
      'any.only': 'Time format must be either 12 or 24',
      'any.required': 'Time format is required'
    }),
  
  autoRefresh: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Auto refresh must be a boolean value',
      'any.required': 'Auto refresh is required'
    }),
  
  refreshInterval: Joi.number()
    .integer()
    .min(5)
    .max(300)
    .required()
    .messages({
      'number.min': 'Refresh interval must be at least 5 seconds',
      'number.max': 'Refresh interval cannot exceed 300 seconds',
      'number.integer': 'Refresh interval must be a whole number',
      'any.required': 'Refresh interval is required'
    })
});

export const adminGeneralSettingsSchema = Joi.object({
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
  
  profileImage: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Profile image must be a valid URL'
    }),
  
  theme: Joi.string()
    .valid('light', 'dark', 'system')
    .optional()
    .messages({
      'any.only': 'Theme must be one of: light, dark, system'
    }),
  
  language: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'Language must be a string'
    }),
  
  timezone: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'Timezone must be a string'
    }),
  
  dateFormat: Joi.string()
    .valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')
    .optional()
    .messages({
      'any.only': 'Date format must be one of: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD'
    }),
  
  timeFormat: Joi.string()
    .valid('12', '24')
    .optional()
    .messages({
      'any.only': 'Time format must be either 12 or 24'
    }),
  
  autoRefresh: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Auto refresh must be a boolean value'
    }),
  
  refreshInterval: Joi.number()
    .integer()
    .min(5)
    .max(300)
    .optional()
    .messages({
      'number.min': 'Refresh interval must be at least 5 seconds',
      'number.max': 'Refresh interval cannot exceed 300 seconds',
      'number.integer': 'Refresh interval must be a whole number'
    })
});
