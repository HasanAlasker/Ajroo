// requestValidation.js
import Joi from "joi";

// Create request (borrower requests to rent item)
export const createRequestValidation = Joi.object({
  durationValue: Joi.number().integer().min(1).required(),
  durationUnit: Joi.string().valid("hour", "day", "week", "month").required(),
  pricePerDay: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
  startDate: Joi.date().iso().min("now").required().messages({
    "date.min": "Start date cannot be in the past",
  }),
  endDate: Joi.date()
    .iso()
    .greater(Joi.ref("startDate"))
    .required()
    .messages({
      "date.greater": "End date must be after start date",
    }),
});

// Update request (accept, reject, cancel)
export const updateRequestValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "accepted", "rejected", "cancelled")
    .required(),
});
