import { min } from "lodash";
import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    durationValue: {
      type: Number,
      min: 1,
      required: true,
    },
    durationUnit: {
      type: String,
      lowercase: true,
      enum: ["hour", "day", "week", "month"],
      required: true,
      default: "hour",
    },
    pricePerDay: {
      type: Number,
      min: 0,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    borrowerReturnedAt: {
      type: Date,
    },
    ownerConfirmedReturnAt: {
      // Fixed typo
      type: Date,
    },
    returnStatus: {
      type: String,
      enum: ["on-time", "late", "early"],
    },
    daysLate: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateFees: {
      type: Number,
      default: 0,
      min: 0,
    },
    owenerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    borrowerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    strikesGiven: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
  },
  { timestamps: true }
);

// Indexes
borrowSchema.index({ borrower: 1, status: 1 });
borrowSchema.index({ owner: 1, status: 1 });
borrowSchema.index({ item: 1 });
borrowSchema.index({ endDate: 1, status: 1 }); // For checking overdue rentals

const BorrowModel = mongoose.model("Borrow", borrowSchema);
export default BorrowModel;
