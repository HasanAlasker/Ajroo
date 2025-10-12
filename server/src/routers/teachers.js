import express from "express";
import TeacherModel from "../models/teachersModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const teachers = await TeacherModel.find({ age: { $gte: 18 } }).select(
      "name age _id"
    );
    res.status(200).send(teachers);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post("/", async (req, res) => {
  const data = req.body;
  try {
    const teacher = await TeacherModel.create(data);
    return res.status(200).send(teacher);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    const updatedteacher = await TeacherModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return res.status(200).send(updatedteacher);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedteacher = await TeacherModel.findByIdAndDelete(id);
    return res.status(200).send(deletedteacher);
  } catch (err) {
    return res.status(500).send(err);
  }
});

export default router;
