// import Joi from "joi";
import express from "express";
import CourseModel from "../models/coursesModel.js";

const router = express.Router();

// const validateCourse = (course) => {
//   const schema = Joi.object({
//     name: Joi.string().min(2).required(),
//     id: Joi.number().min(0).max(10),
//   });
//   return schema.validate(course);
// };

router.get("/", async (req, res) => {
  try {
    const courses = await CourseModel.find();
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
  // const { error } = validateCourse(req.body);
  // if (error) {
  //   return res.status(400).send(error.details[0].message);
  // }

  const data = req.body;
  try {
    const result = await CourseModel(data);
    result.save();
    return res.status(200).send(result);
  } catch {
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
  } catch {
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
