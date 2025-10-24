// borrowValidation.js
import Joi from "joi";

// Create borrow (when owner accepts a request)
export const createBorrowValidation = Joi.object({
  durationValue: Joi.number().integer().min(1).required(),
  durationUnit: Joi.string().valid("hour", "day", "week", "month").required(),
  pricePerDay: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required().messages({
    "date.greater": "End date must be after start date",
  }),
});

// Update borrow (for marking return, confirming, etc.)
export const updateBorrowValidation = Joi.object({
  status: Joi.string().valid("active", "pending_return"),
  borrowerReturnedAt: Joi.date().iso(),
  ownerConfirmedReturnAt: Joi.date().iso(),
  returnStatus: Joi.string().valid("on-time", "late", "early"),
  daysLate: Joi.number().integer().min(0),
  lateFees: Joi.number().min(0),
  ownerRating: Joi.number().integer().min(1).max(5),
  borrowerRating: Joi.number().integer().min(1).max(5),
  strikeGivenToBorrower: Joi.boolean(),
}).min(1); // At least one field must be provided

// Rate borrow (separate validation for rating)
export const rateBorrowValidation = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  raterType: Joi.string().valid("owner", "borrower").required(),
});
