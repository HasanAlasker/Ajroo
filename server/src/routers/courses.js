import Joi from "joi";
import express from "express";
import CourseModel from "../models/coursesModel.js";

const router = express.Router();

const validateCourse = (course) => {
  const schema = Joi.object({
    author: Joi.string().min(2).required(),
    tags: Joi.array(),
    isPublished: Joi.boolean(),
    price: Joi.number().min(1).max(1000),
    name: Joi.string().min(2).required(),
    category: Joi.string()
  });
  return schema.validate(course);
};

router.get("/", async (req, res) => {
  try {
    const courses = await CourseModel.find().sort({price:1}).select({name:1, price:1,});
    return res.send(courses);
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const course = await CourseModel.findById(id);
  if (!course)
    return res.status(404).send("Course with this id was not found!");

  return res.status(200).send(course);
});

router.get("/:id/:name", (req, res) => {
  return res.send(req.params);
});

router.post("/", async (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const data = req.body;
  try {
    const course = await CourseModel.create(data);
    return res.status(200).send(course);
  } catch (err) {
    console.log(err);
    for(const field in err.errors){
      console.log(err.errors[field].message)
    }
    return res.status(500).send("Something went wrong");
  }
});

router.put("/:id", async (req, res) => {
  // const { error } = validateCourse(req.body);
  // if (error) {
  //   return res.status(400).send(error.details[0].message);
  // }
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await CourseModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return res.status(200).send(result);
  } catch (err) {
    for (const field in err.errors) {
      console.log(err.errors[field].message);
    }
    console.log(err)
    return res.status(500).send("Something went wrong");
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const course = await CourseModel.findByIdAndDelete(id);
    if (!course) return res.status(404).send("No course has this id");

    return res.status(200).send(course);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;
