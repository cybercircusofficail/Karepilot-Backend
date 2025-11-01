import Joi from 'joi';

export const adminSecuritySettingsSchema = Joi.object({
  twoFactorEnabled: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Two-factor authentication must be a boolean value',
      'any.required': 'Two-factor authentication setting is required'
    }),
  
  sessionTimeout: Joi.number()
    .integer()
    .min(5)
    .max(480)
    .required()
    .messages({
      'number.min': 'Session timeout must be at least 5 minutes',
      'number.max': 'Session timeout cannot exceed 8 hours',
      'number.integer': 'Session timeout must be a whole number',
      'any.required': 'Session timeout is required'
    }),
  
  maxLoginAttempts: Joi.number()
    .integer()
    .min(3)
    .max(10)
    .required()
    .messages({
      'number.min': 'Max login attempts must be at least 3',
      'number.max': 'Max login attempts cannot exceed 10',
      'number.integer': 'Max login attempts must be a whole number',
      'any.required': 'Max login attempts is required'
    }),
  
  passwordExpiry: Joi.number()
    .integer()
    .min(30)
    .max(365)
    .required()
    .messages({
      'number.min': 'Password expiry must be at least 30 days',
      'number.max': 'Password expiry cannot exceed 365 days',
      'number.integer': 'Password expiry must be a whole number',
      'any.required': 'Password expiry is required'
    }),
  
  auditLogs: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Audit logs must be a boolean value',
      'any.required': 'Audit logs setting is required'
    })
});

export const adminPasswordChangeSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
  
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match new password',
      'any.required': 'Confirm new password is required'
    })
});
