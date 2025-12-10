import Joi from "joi";

// Validation for creating a new ad
export const createAdSchema = Joi.object({
  image: Joi.string()
    .uri()
    .required()
    .messages({
      "string.uri": "Image must be a valid URL",
      "any.required": "Image is required",
    }),
  imagePublicId: Joi.string()
    .optional()
    .allow(""),
  link: Joi.string()
    .uri()
    .required()
    .messages({
      "string.uri": "Link must be a valid URL",
      "any.required": "Link is required",
    }),
  isApproved: Joi.boolean()
    .optional()
    .default(false),
  isActive: Joi.boolean()
    .optional()
    .default(false),
});

// Validation for updating an ad
export const updateAdSchema = Joi.object({

  image: Joi.string()
    .uri(),
  imagePublicId: Joi.string()
    .allow(""),
  link: Joi.string()
    .uri(),
  isApproved: Joi.boolean(),
  isActive: Joi.boolean(),
}).min(1);

// Validation for ad ID parameter
export const adIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid ad ID format",
      "any.required": "Ad ID is required",
    }),
});