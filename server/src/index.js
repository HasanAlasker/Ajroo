import dotenv from "dotenv";
import Joi from "joi";
import express from "express";
import logger from "./middleware/logger.js";
import courses from "./routers/courses.js";
import home from "./routers/home.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to mongoDB... ✅"))
  .catch((err) => console.error("Error connecting to mongoDB... ❌", err));

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
  date: { type: Date, default: Date.now() },
  isPublished: Boolean,
});

const CourseModel = mongoose.model("Course", courseSchema); // this is a class (model to use the Schema)

const createCourse = async () => {
  try {
    const course = new CourseModel({
      // this is an object of the class
      author: "Hasan Alasker",
      name: "flutter",
      isPublished: true,
      tags: ["online", "ReactNative", "mobile"],
    });

    const result = await course.save();
    console.log(result);
  } catch (err) {
    console.log("error adding course", err);
  }
};

createCourse()

const getCourses = async () => {
  try {
    const courses = await CourseModel.find({ isPublished: true })
      .limit(10)
      .sort({ name: 1 })
      .select({ name: true, _id: false });
    console.log(courses);
  } catch (err) {
    console.log(err);
  }
};

getCourses();

const validateCourse = (course) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    id: Joi.number().min(0).max(10),
  });
  return schema.validate(course);
};

app.use(logger); // my first custom middleware
app.use(express.json());
app.use("/api/courses", courses);
app.use("/", home);

app.listen(port, () => console.log(`listening to port ${port}`));
