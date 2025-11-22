import Joi from 'joi';

const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

const fullNameSchema = Joi.string()
  .min(2)
  .max(100)
  .trim()
  .required()
  .messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name cannot exceed 100 characters',
    'any.required': 'Full name is required'
  });

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters',
    'any.required': 'Password is required'
  });

const confirmPasswordSchema = Joi.string()
  .valid(Joi.ref('password'))
  .required()
  .messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required'
  });

export const mobileUserRegistrationSchema = Joi.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema.required()
});

export const mobileUserLoginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const mobileUserUpdateSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  profileImage: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Profile image must be a valid URL'
    })
});

export const mobilePasswordChangeSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: passwordSchema.messages({
    'string.min': 'New password must be at least 8 characters long',
    'string.pattern.base': 'New password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters',
    'any.required': 'New password is required'
  }),
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'New passwords do not match',
      'any.required': 'New password confirmation is required'
    })
});

export const emailVerificationSchema = Joi.object({
  code: Joi.string()
    .length(4)
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.length': 'Verification code must be exactly 4 digits',
      'string.pattern.base': 'Verification code must contain only numbers',
      'any.required': 'Verification code is required'
    })
});

export const resendVerificationSchema = Joi.object({
  email: emailSchema
});

export const userSettingsSchema = Joi.object({
  navigationPreferences: Joi.object({
    stepFreeRouteOnly: Joi.boolean().optional(),
    largeTouchTargets: Joi.boolean().optional()
  }).optional(),
  languageAndVoice: Joi.object({
    displayLanguage: Joi.string().trim().optional(),
    voiceGuidance: Joi.boolean().optional()
  }).optional(),
  accessibility: Joi.object({
    voiceNavigation: Joi.boolean().optional(),
    stepRoutesOnly: Joi.boolean().optional(),
    largeTextMode: Joi.boolean().optional()
  }).optional()
}).min(1).messages({
  'object.min': 'At least one settings field must be provided'
});

export const passwordResetRequestSchema = Joi.object({
  email: emailSchema
});

export const passwordResetVerifySchema = Joi.object({
  code: Joi.string()
    .length(4)
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.length': 'Reset code must be exactly 4 digits',
      'string.pattern.base': 'Reset code must contain only numbers',
      'any.required': 'Reset code is required'
    })
});

export const passwordResetSchema = Joi.object({
  newPassword: passwordSchema.messages({
    'string.min': 'New password must be at least 8 characters long',
    'string.pattern.base': 'New password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters',
    'any.required': 'New password is required'
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

