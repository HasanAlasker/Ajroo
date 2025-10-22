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
    requestedStartDate: {
      type: Date,
      required: true,
    },
    requestedEndDate: {
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