import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [2, "Name must be at least 2 characters long"],
    maxLength: [25, "Name can't be longer than 25 characters"],
    match: [/^[a-zA-Z\s'-]+$/, "Please enter a valid name"],
    required: true,
    trim: true,
  },
  email: {
    type: String,
    minLength: [5, "Email must be at least 5 characters long"],
    maxLength: [255, "Email can't be longer than 255 characters"],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    minLength: [8, "Password must be at least 8 characters long"],
    maxLength: [128, "Password can't be longer than 128 characters"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)",
    ],
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
    match: [
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      "Please enter a valid phone number",
    ],
  },
  gender: {
    type: String,
    lowercase: true,
    trim: true,
    enum: ["male", "female"],
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  strikes: {
    type: Number,
    default: 0,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
