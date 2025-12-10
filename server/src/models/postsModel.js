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
    imagePublicId: {
      type: String,
    },
    type: {
      type: String,
      lowercase: true,
      enum: ["sell", "rent"],
      required: true,
      default: "rent",
    },
    name: {
      type: String,
      minLength: 2,
      maxLength: 500,
      lowercase: true,
      required: true,
    },
    category: {
      type: String,
      minLength: 2,
      maxLength: 500,
      lowercase: true,
      enum: [
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
        "baby_kids",
        "vehicles",
        "realestate",
      ],
      required: true,
    },
    pricePerDay: {
      type: Number,
      min: 0,
      max: 300, // change it later if expensive items are requested to be added in the app
      // required: true,
    },
    sellPrice: {
      type: Number,
      min: 0,
    },
    city: {
      type: String,
      minLength: 2,
      maxLength: 500,
      lowercase: true,
      required: true,
    },
    area: {
      type: String,
      minLength: 2,
      maxLength: 500,
      lowercase: true,
      required: true,
    },
    status: {
      type: String,
      lowercase: true,
      enum: ["available", "taken", "disabled"],
      default: "available",
      required: true,
    },
    condition: {
      type: String,
      lowercase: true,
      enum: ["band_new", "excellent", "very_good", "good", "fair", "needs_repair"],
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

    // soft delete (admin)
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    currentBorrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Borrow",
    },
    // use it like this:

    // const post = await PostModel.findById(id).populate({
    //   path: 'currentBorrow',
    //   populate: { path: 'borrower', select: 'name image' }
    // });

    // const borrower = post.currentBorrow?.borrower;

    rentStartDate: Date,
    rentEndDate: Date,
    reservedUntil: Date,
    description: {
      type: String,
      min: 10,
      max: 2000,
    },
  },
  { timestamps: true }
);

// Essential indexes:
postSchema.index({ city: 1, area: 1, status: 1 }); // Location filtering
postSchema.index({ category: 1, status: 1 }); // Category filtering
postSchema.index({ user: 1 }); // User's posts

const PostModel = mongoose.model("Post", postSchema);
export default PostModel;
