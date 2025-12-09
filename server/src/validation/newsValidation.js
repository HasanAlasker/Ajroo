import Joi from "joi";

export const createNewsValidation = Joi.object({
  title: Joi.string().min(2).max(500).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 2 characters",
    "string.max": "Title cannot exceed 500 characters",
  }),

  description: Joi.string().min(2).max(5000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 2 characters",
    "string.max": "Description cannot exceed 5000 characters",
  }),

  displayDuration: Joi.number().integer().min(1).max(365).required().messages({
    "number.base": "Display duration must be a number",
    "number.min": "Display duration must be at least 1 day",
    "number.max": "Display duration cannot exceed 365 days",
  }),

  backGroundColor: Joi.string().min(1).max(50).required().messages({
    "string.empty": "Background color is required",
    "string.max": "Background color key cannot exceed 50 characters",
  }),

  borderColor: Joi.string().min(1).max(50).required().messages({
    "string.empty": "Border color is required",
    "string.max": "Border color key cannot exceed 50 characters",
  }),

  textColor: Joi.string().min(1).max(50).required().messages({
    "string.empty": "Text color is required",
    "string.max": "Text color key cannot exceed 50 characters",
  }),

  isActive: Joi.boolean().default(true),

  icon: Joi.string().max(100).optional().allow(""),

  actionButton: Joi.boolean().optional(),
});

export const editNewsValidation = Joi.object({
  title: Joi.string().min(2).max(500).messages({
    "string.min": "Title must be at least 2 characters",
    "string.max": "Title cannot exceed 500 characters",
  }),

  description: Joi.string().min(2).max(5000).messages({
    "string.min": "Description must be at least 2 characters",
    "string.max": "Description cannot exceed 5000 characters",
  }),

  displayDuration: Joi.number().integer().min(1).max(365).messages({
    "number.base": "Display duration must be a number",
    "number.min": "Display duration must be at least 1 day",
    "number.max": "Display duration cannot exceed 365 days",
  }),

  backGroundColor: Joi.string().min(1).max(50).messages({
    "string.max": "Background color key cannot exceed 50 characters",
  }),

  borderColor: Joi.string().min(1).max(50).messages({
    "string.max": "Border color key cannot exceed 50 characters",
  }),

  textColor: Joi.string().min(1).max(50).messages({
    "string.max": "Text color key cannot exceed 50 characters",
  }),

  isActive: Joi.boolean(),

  icon: Joi.string().max(100).allow(""),

  actionButton: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });
