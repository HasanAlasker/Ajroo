import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ReportModel = mongoose.model("Report", ReportSchema);
export default ReportModel;
