// requestValidation.js
import Joi from "joi";

// Create request (borrower requests to rent item)
export const createRequestValidation = Joi.object({
  durationValue: Joi.number().integer().min(1).required(),
  durationUnit: Joi.string().valid("hour", "day", "week", "month").required(),
  pricePerDay: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
  endDate: Joi.date().iso().min('now').required(),
});

// Update request (accept, reject, cancel)
export const updateRequestValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "accepted", "rejected", "cancelled")
    .required(),
});
