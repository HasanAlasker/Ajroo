import express from "express";
import mongoose from "mongoose";
import NewsModel from "../models/newsModel.js";
import admin from "../middleware/admin.js";
import auth from "../middleware/auth.js";
import { createNewsValidation } from "../validation/newsValidation.js";
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

// get active new banner (auth users)

// get news log (auth/ admin)

export default router;
