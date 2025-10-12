import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teachers"
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  tags: {
    type: Array,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "a course should have at least one tag",
    },
  },
  category: {
    type: String,
    required: true,
    enum: ["web", "mobile", "desktop"],
  },
  date: { type: Date, default: Date.now },
  isPublished: Boolean,
  price: {
    type: Number,
    required: function () {
      return this.isPublished === true;
    },
    min: 1,
    max: 1000,
  },
});

const CourseModel = mongoose.model("Course", courseSchema);
export default CourseModel;
