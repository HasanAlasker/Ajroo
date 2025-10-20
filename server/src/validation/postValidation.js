import Joi from "joi";

// Validation schema for creating a new post
export const createPostValidation = Joi.object({
  user: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "User ID must be a valid MongoDB ObjectId",
      "any.required": "User is required",
    }),

  image: Joi.string().uri().required().messages({
    "string.uri": "Image must be a valid URL",
    "any.required": "Image is required",
  }),

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
      "transportation",
      "realestate"
    )
    .messages({
      "string.min": "Category must be at least 2 characters long",
      "string.max": "Category cannot exceed 500 characters",
      "any.required": "Category is required",
    }),

  pricePerDay: Joi.number().min(0).max(300).required().messages({
    "number.min": "Price per day must be at least 0",
    "number.max": "Price per day cannot exceed 300",
    "any.required": "Price per day is required",
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
    .valid("available", "taken", "pending", "early", "late")
    .default("available")
    .messages({
      "any.only":
        "Status must be one of: available, taken, pending, early, late",
    }),

  condition: Joi.string()
    .lowercase()
    .valid("excellent", "very_good", "good", "fair", "needs_repair")
    .required()
    .messages({
      "any.only":
        "Condition must be one of: excellent, very good, good, fair, needs repair",
      "any.required": "Condition is required",
    }),

  isRated: Joi.boolean().default(false),

  rating: Joi.number().min(0).max(5).default(0).messages({
    "number.min": "Rating must be at least 0",
    "number.max": "Rating cannot exceed 5",
  }),

  ratingCount: Joi.number().min(0).default(0).messages({
    "number.min": "Rating count must be at least 0",
  }),
});

// Validation schema for updating a post (all fields optional)
export const updatePostValidation = Joi.object({
  image: Joi.string().uri().messages({
    "string.uri": "Image must be a valid URL",
  }),

  name: Joi.string().min(2).max(500).messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 500 characters",
  }),

  category: Joi.string().min(2).max(500).messages({
    "string.min": "Category must be at least 2 characters long",
    "string.max": "Category cannot exceed 500 characters",
  }),

  pricePerDay: Joi.number().min(0).max(300).messages({
    "number.min": "Price per day must be at least 0",
    "number.max": "Price per day cannot exceed 300",
  }),

  city: Joi.string().min(2).max(500).messages({
    "string.min": "City must be at least 2 characters long",
    "string.max": "City cannot exceed 500 characters",
  }),

  area: Joi.string().min(2).max(500).messages({
    "string.min": "Area must be at least 2 characters long",
    "string.max": "Area cannot exceed 500 characters",
  }),

  status: Joi.string()
    .lowercase()
    .valid("available", "taken", "pending", "early", "late")
    .messages({
      "any.only":
        "Status must be one of: available, taken, pending, early, late",
    }),

  condition: Joi.string()
    .lowercase()
    .valid("excellent", "very good", "good", "fair", "needs repair")
    .messages({
      "any.only":
        "Condition must be one of: excellent, very good, good, fair, needs repair",
    }),

  isRated: Joi.boolean(),

  rating: Joi.number().min(0).max(5).messages({
    "number.min": "Rating must be at least 0",
    "number.max": "Rating cannot exceed 5",
  }),

  ratingCount: Joi.number().min(0).messages({
    "number.min": "Rating count must be at least 0",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Usage example in your route/controller:
// const { error, value } = createPostValidation.validate(req.body);
// if (error) return res.status(400).json({ message: error.details[0].message });
