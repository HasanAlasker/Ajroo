import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
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
    link: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    displayDuration: {
      type: Number, // number of days to show
      required: true,
    },
    expiresAt: {
      type: Date,
      // auto-calculated from displayDuration
    },
  },
  { timestamps: true }
);

const AdModel = new mongoose.model("Ad", adSchema);
export default AdModel;
