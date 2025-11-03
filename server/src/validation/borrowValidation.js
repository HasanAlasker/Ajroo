import Joi from "joi";

// Create borrow (when owner accepts a request)
export const createBorrowValidation = Joi.object({
  startDate: Joi.date().iso().required(),
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
