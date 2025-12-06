import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minLength: 2,
      maxLength: 500,
      required: true,
    },
    description: {
      type: String,
      minLength: 2,
      maxLength: 5000,
      required: true,
    },
    displayDuration: {
      type: Number, // number of days to show
      required: true,
    },
    backGroundColor: {
      type: String,
      required: true,
    },
    borderColor: {
      type: String,
      required: true,
    },
    textColor: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // allows you to deactivate without deleting
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      // auto-calculated from displayDuration
    },
    icon: {
      type: String,
    },
    actionButton: {
      text: String,
      link: String, // deep link to a screen or external URL
    },
  },
  { timestamps: true }
);

const NewsModel = new mongoose.model("New", newsSchema);
export default NewsModel;
