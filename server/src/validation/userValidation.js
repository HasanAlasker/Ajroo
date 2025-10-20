import Joi from "joi";

// Joi validation schema for User
export const userValidationSchema = Joi.object({
  image: Joi.string().uri().required().messages({
    "string.uri": "Image must be a valid URL",
    "any.required": "Image is required",
  }),
  name: Joi.string()
    .min(2)
    .max(25)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required()
    .trim()
    .messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name can't be longer than 25 characters",
      "string.pattern.base": "Please enter a valid name",
      "any.required": "Name is required",
    }),

  email: Joi.string()
    .min(5)
    .max(255)
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.min": "Email must be at least 5 characters long",
      "string.max": "Email can't be longer than 255 characters",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password can't be longer than 128 characters",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)",
      "any.required": "Password is required",
    }),

  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .required()
    .trim()
    .messages({
      "string.pattern.base": "Please enter a valid phone number",
      "any.required": "Phone number is required",
    }),

  gender: Joi.string()
    .valid("male", "female")
    .required()
    .lowercase()
    .trim()
    .messages({
      "any.only": "Gender must be either male or female",
      "any.required": "Gender is required",
    }),

  role: Joi.string().valid("user", "admin").default("user").messages({
    "any.only": "Role must be either user or admin",
  }),

  strikes: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Strikes cannot be negative",
  }),

  rating: Joi.number().min(0).max(5).default(0).messages({
    "number.min": "Rating must be at least 0",
    "number.max": "Rating cannot exceed 5",
  }),

  ratingCount: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Rating count cannot be negative",
  }),
});

// Validation for user registration (only required fields)
export const userRegistrationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(25)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required()
    .trim()
    .messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name can't be longer than 25 characters",
      "string.pattern.base": "Please enter a valid name",
      "any.required": "Name is required",
    }),

  email: Joi.string()
    .min(5)
    .max(255)
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.min": "Email must be at least 5 characters long",
      "string.max": "Email can't be longer than 255 characters",
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password can't be longer than 128 characters",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)",
      "any.required": "Password is required",
    }),

  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .required()
    .trim()
    .messages({
      "string.pattern.base": "Please enter a valid phone number",
      "any.required": "Phone number is required",
    }),

  gender: Joi.string()
    .valid("male", "female")
    .required()
    .lowercase()
    .trim()
    .messages({
      "any.only": "Gender must be either male or female",
      "any.required": "Gender is required",
    }),
});

// Validation for user login
export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Validation for updating user profile
export const userUpdateSchema = Joi.object({
  image: Joi.string().uri().required().messages({
    "string.uri": "Image must be a valid URL",
    "any.required": "Image is required",
  }),
  name: Joi.string()
    .min(2)
    .max(25)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .trim()
    .messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name can't be longer than 25 characters",
      "string.pattern.base": "Please enter a valid name",
    }),

  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .trim()
    .messages({
      "string.pattern.base": "Please enter a valid phone number",
    }),
  email: Joi.string().email().lowercase().trim().messages({
    "string.email": "Please enter a valid email address",
  }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password can't be longer than 128 characters",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)",
    }),
}).min(1); // At least one field must be provided for update
