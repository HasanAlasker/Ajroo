import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      minLength: 2,
      maxLength: 500,
      required: true,
    },
    category: {
      type: String,
      minLength: 2,
      maxLength: 500,
      required: true,
      // maybe here i can add enum: ['sports', 'transportation', ...]
      // or make a schema for categories?
    },
    pricePerDay: {
      type: Number,
      min: 0,
      max: 300, // change it later if expensive items are requested to be added in the app
      required: true,
    },
    city: {
      type: String,
      minLength: 2,
      maxLength: 500,
      required: true,
    },
    area: {
      type: String,
      minLength: 2,
      maxLength: 500,
      required: true,
    },
    status: {
      type: String,
      lowercase: true,
      enum: ["available", "taken", "pending", "early", "late"],
      default: "available",
      required: true,
    },
    condition: {
      type: String,
      lowercase: true,
      enum: ["excellent", "very good", "good", "fair", "needs repair"],
      required: true,
    },
    isRated: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

// Essential indexes:
postSchema.index({ city: 1, area: 1, status: 1 }); // Location filtering
postSchema.index({ category: 1, status: 1 });      // Category filtering
postSchema.index({ user: 1 });                     // User's posts

const PostModel = mongoose.model("Post", postSchema);
export default PostModel;
