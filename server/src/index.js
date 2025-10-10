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

// createCourse();

const getCourses = async () => {
  // comparison operators:
  // eq (equal to)
  // ne (not equal to)
  // gt (greater than)
  // gte (greater than or equal to)
  // lt (less than)
  // lte (less than or equal to)
  // in
  // nin (not in)

  // logical operators
  // or     ex: courseModle.find().or([ {author: "Hasan Alasker"}, {isPublished: true} ])
  // and    ex: // // .and([ {author: "Hasan Alasker"}, {isPublished: true} ])

  // regular expressions (example based)
  // .find({ author : /^Hasan/ })  // find string that STARTS with Hasan, it will only find the first one
  // .find({ author : /^Hasan/g })  // find string that STARTS with Hasan, it will find all
  // .find({ author : /^Hasan/i })  // make it not case sensitive (it can find hasan also)
  // .find({ author : /^Hasan/gi })  // make it not case sensitive and find all of them
  // .find({ author : /Alasker$/ })  // find string that ENDS with Alasker, make it not case sensitive by adding i
  // .find( { author : /.*Alasker*./ }) find strings that CONTAIN Alasker, add i if you want

  // to devide big data into chunks for performance we use PAGINATION, ex: load 10 posts at a time.
  const pageNumber = 1;
  const pageSize = 10; // you usually get this form an API query api/courses?pageNumber=2&pageSize=10
  // use .skip((pageNumber-1)*pageSize) and .limit(pageSize) for it

  try {
    const courses = await CourseModel.find()
      .or([{ author: /.*omar*./i }, { name: /an*/ }, { price: { $gte: 15 } }])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ price: 1 })
      .select({ name: true, _id: false, price: true, author: true });
    // .countDocuments() // just gives you the number of documents (also based on your filtiring)
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
