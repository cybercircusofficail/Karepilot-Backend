import Joi from 'joi';

export const adminNotificationSettingsSchema = Joi.object({
  emailNotifications: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Email notifications must be a boolean value',
      'any.required': 'Email notifications setting is required'
    }),
  
  pushNotifications: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Push notifications must be a boolean value',
      'any.required': 'Push notifications setting is required'
    }),
  
  smsAlerts: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'SMS alerts must be a boolean value',
      'any.required': 'SMS alerts setting is required'
    }),
  
  securityAlerts: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Security alerts must be a boolean value',
      'any.required': 'Security alerts setting is required'
    }),
  
  emergencyAlerts: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Emergency alerts must be a boolean value',
      'any.required': 'Emergency alerts setting is required'
    }),
  
  weeklyReports: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Weekly reports must be a boolean value',
      'any.required': 'Weekly reports setting is required'
    })
});
