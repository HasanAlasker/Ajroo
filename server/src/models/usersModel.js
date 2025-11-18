import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

dotenv.config();

const userSchema = new mongoose.Schema(
  {
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
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      // Joi will handle the rest
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
        "Please enter a valid phone number",
      ],
      unique: true,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dwiw2bprt/image/upload/v1762451339/bf496wsayryocrugd7kn.png",
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
    strikes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isRated: {
      type: Boolean,
      default: false,
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
    pushNotificationTokens: [
      {
        token: String,
        platform: String, // 'ios' or 'android'
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    postCount:{
      type: Number,
      default:0
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    // RevenueCat App User ID (important!)
    revenueCatUserId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      role: this.role,
      email: this.email,
      phone: this.phone,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};

userSchema.methods.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
