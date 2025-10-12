import express from "express";
import StudentModel from "../models/studentsModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const students = await StudentModel.find({ age: { $gte: 18 } }).select(
      "name age _id"
    );
    res.status(200).send(students);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post("/", async (req, res) => {
  const data = req.body;
  try {
    const course = await StudentModel.create(data);
    return res.status(200).send(course);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    const updatedCourse = await StudentModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return res.status(200).send(updatedCourse);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedCourse = await StudentModel.findByIdAndDelete(id);
    return res.status(200).send(deletedCourse);
  } catch (err) {
    return res.status(500).send(err);
  }
});

export default router;
