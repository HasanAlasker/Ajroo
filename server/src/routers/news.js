import express from "express";
import mongoose from "mongoose";
import NewsModel from "../models/newsModel.js";
import admin from "../middleware/admin.js";
import auth from "../middleware/auth.js";
import {
  createNewsValidation,
  editNewsValidation,
} from "../validation/newsValidation.js";
import validate from "../middleware/joiValidation.js";

const router = express.Router();

// create news (admin)

router.post(
  "/create",
  [auth, admin, validate(createNewsValidation)],
  async (req, res) => {
    const data = req.body;

    const newNews = new NewsModel(data);
    if (!newNews)
      return res.status(400).send("News not created, something went wrong!");

    newNews.isActive = "false";

    const savedNews = await newNews.save();
    return res.status(200).send(savedNews);
  }
);

// edit news (admin)

router.put(
  "/edit/:id"[(auth, admin, validate(editNewsValidation))],
  async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid news ID");
    }

    const editedNews = await NewsModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!editedNews)
      return res.status(400).send("Didn't update, something went wrong!");

    return res.status(200).send(editedNews);
  }
);

// delete news (admin)

router.delete("/delete/:id", [auth, admin], async (req, res) => {
  const id = req.params.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid news ID");
  }

  const deletedNews = await NewsModel.findByIdAndDelete(id);
  if (!deletedNews)
    return res.status(400).send("Didn't delete, something went wrong!");

  return res.status(200).send(deletedNews);
});

// deactivate news (admin)

router.put("/deactivate/:id", [auth, admin], async (req, res) => {
  const id = req.params.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid news ID");
  }

  const deactivatedNews = await NewsModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  return res.status(200).send(deactivatedNews);
});

// deactivate news (admin)

router.put("/activate/:id", [auth, admin], async (req, res) => {
  const id = req.params.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid news ID");
  }

  const activatedNews = await NewsModel.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  );

  return res.status(200).send(activatedNews);
});

// get news log (auth/ admin)

router.get("/", auth, async (req, res) => {
  const allNews = await NewsModel.find();
  if (!allNews) return res.status(404).send("No news found");
  return res.status(200).send(allNews);
});

// get active new banner (auth users)

router.get("/active", auth, async (req, res) => {
  const activeNews = await NewsModel.findOne({ isActive: true });
  if (!activeNews) return res.status(404).send("No active news found");
  return res.status(200).send(activeNews);
});

export default router;
