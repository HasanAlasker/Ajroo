import Joi from "joi";

// Validation schema for creating a new post
export const createPostValidation = Joi.object({
  image: Joi.string().uri().required().messages({
    "string.uri": "Image must be a valid URL",
    "any.required": "Image is required",
  }),

  imagePublicId: Joi.string().allow(null, ""),

  name: Joi.string().min(2).max(500).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 500 characters",
    "any.required": "Name is required",
  }),

  category: Joi.string()
    .min(2)
    .max(500)
    .required()
    .valid(
      "tools",
      "household",
      "electronics",
      "garden",
      "sports",
      "clothes",
      "events",
      "books",
      "furniture",
      "automotive",
      "realestate",
      "baby_kids"
    )
    .messages({
      "string.min": "Category must be at least 2 characters long",
      "string.max": "Category cannot exceed 500 characters",
      "any.only":
        "Category must be one of: tools, household, electronics, garden, sports, clothes, events, books, furniture, automotive, realestate, baby_kids",
      "any.required": "Category is required",
    }),

  // Type field to distinguish between Rent and Sell
  type: Joi.string().valid("Rent", "Sell").required().messages({
    "any.only": "Type must be either 'Rent' or 'Sell'",
    "any.required": "Type is required",
  }),

  // Price per day - required only for Rent type
  pricePerDay: Joi.when("type", {
    is: "Rent",
    then: Joi.number().min(0).max(300).required().messages({
      "number.min": "Price per day must be at least 0",
      "number.max": "Price per day cannot exceed 300",
      "any.required": "Price per day is required for rental items",
    }),
    otherwise: Joi.forbidden(),
  }),

  // Selling price - required only for Sell type
  sellPrice: Joi.when("type", {
    is: "Sell",
    then: Joi.number().min(1).required().messages({
      "number.min": "Selling price must be at least 1",
      "any.required": "Selling price is required for items being sold",
    }),
    otherwise: Joi.forbidden(),
  }),

  // Description - optional for Rent, can be used for Sell
  description: Joi.string().min(10).max(2000).allow("", null).messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 2000 characters",
  }),

  city: Joi.string().min(2).max(500).required().messages({
    "string.min": "City must be at least 2 characters long",
    "string.max": "City cannot exceed 500 characters",
    "any.required": "City is required",
  }),

  area: Joi.string().min(2).max(500).required().messages({
    "string.min": "Area must be at least 2 characters long",
    "string.max": "Area cannot exceed 500 characters",
    "any.required": "Area is required",
  }),

  status: Joi.string()
    .lowercase()
    .valid("available", "taken", "disabled")
    .default("available")
    .messages({
      "any.only": "Status must be one of: available, taken, disabled",
    }),

  condition: Joi.string()
    .lowercase()
    .valid("excellent", "very_good", "good", "fair", "needs_repair")
    .required()
    .messages({
      "any.only":
        "Condition must be one of: excellent, very_good, good, fair, needs_repair",
      "any.required": "Condition is required",
    }),
});

// Validation schema for updating a post (all fields optional)
export const updatePostValidation = Joi.object({
  image: Joi.string().uri().messages({
    "string.uri": "Image must be a valid URL",
  }),

  imagePublicId: Joi.string().allow(null, ""),

  name: Joi.string().min(2).max(500).messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 500 characters",
  }),

  category: Joi.string()
    .min(2)
    .max(500)
    .valid(
      "tools",
      "household",
      "electronics",
      "garden",
      "sports",
      "clothes",
      "events",
      "books",
      "furniture",
      "automotive",
      "realestate",
      "baby_kids"
    )
    .messages({
      "string.min": "Category must be at least 2 characters long",
      "string.max": "Category cannot exceed 500 characters",
      "any.only":
        "Category must be one of: tools, household, electronics, garden, sports, clothes, events, books, furniture, automotive, realestate, baby_kids",
    }),

  type: Joi.string().valid("Rent", "Sell").messages({
    "any.only": "Type must be either 'Rent' or 'Sell'",
  }),

  pricePerDay: Joi.number().min(0).max(300).messages({
    "number.min": "Price per day must be at least 0",
    "number.max": "Price per day cannot exceed 300",
  }),

  sellPrice: Joi.number().min(1).messages({
    "number.min": "Selling price must be at least 1",
  }),

  description: Joi.string().min(10).max(2000).allow("", null).messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 2000 characters",
  }),

  city: Joi.string().min(2).max(500).messages({
    "string.min": "City must be at least 2 characters long",
    "string.max": "City cannot exceed 500 characters",
  }),

  area: Joi.string().min(2).max(500).messages({
    "string.min": "Area must be at least 2 characters long",
    "string.max": "Area cannot exceed 500 characters",
  }),

  condition: Joi.string()
    .lowercase()
    .valid("excellent", "very_good", "good", "fair", "needs_repair")
    .messages({
      "any.only":
        "Condition must be one of: excellent, very_good, good, fair, needs_repair",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  })
  .unknown(false);

// Validation schema for updating Status
export const updatePostStatusValidation = Joi.object({
  status: Joi.string().valid("available", "taken", "disabled").required(),
  currentBorrow: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  rentStartDate: Joi.date().iso(),
  rentEndDate: Joi.date().iso(),
  reservedUntil: Joi.date().iso(),
});