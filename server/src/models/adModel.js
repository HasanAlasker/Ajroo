import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
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
    type: String
  },
  link:{
    type: String,
    required: true
  }
});

const AdModel = new mongoose.model("Ad", adSchema);
export default AdModel;
