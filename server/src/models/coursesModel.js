import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  tags: [String],
  date: { type: Date, default: Date.now },
  isPublished: Boolean,
  price: Number,
});

const CourseModel =  mongoose.model("Course", courseSchema)
export default CourseModel