import Joi from "joi";

export const createReport = Joi.object({
  reporter: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Reporter must be a valid MongoDB ObjectId",
      "any.required": "Reporter is required",
    }),
  reportedPost: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Reported item must be a valid MongoDB ObjectId",
    }),
  reportedUser: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Reported user must be a valid MongoDB ObjectId",
    }),
  reason: Joi.string().min(3).max(500).required().messages({
    "string.min": "Reason must be at least 3 characters long",
    "string.max": "Reason cannot exceed 500 characters",
    "any.required": "Reason is required",
  }),
})
  .or("reportedItem", "reportedUser")
  .messages({
    "object.missing": "Either reportedItem or reportedUser must be provided",
  });
