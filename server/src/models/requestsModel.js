import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

requestSchema.index({ item: 1, status: 1 });
requestSchema.index({ requester: 1 });
requestSchema.index({ owner: 1, status: 1 });

const RequestModel = mongoose.model("Request", requestSchema);
export default RequestModel;
