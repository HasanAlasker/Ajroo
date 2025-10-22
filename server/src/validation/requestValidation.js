// requestValidation.js
import Joi from "joi";

// Create request (borrower requests to rent item)
export const createRequestValidation = Joi.object({
  requestedStartDate: Joi.date().iso().min("now").required()
    .messages({
      "date.min": "Start date cannot be in the past",
    }),
  requestedEndDate: Joi.date()
    .iso()
    .greater(Joi.ref("requestedStartDate"))
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
