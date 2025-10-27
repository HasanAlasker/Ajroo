import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import validate from "../middleware/joiValidation.js";
import { createReport } from "../validation/reportValidation.js";
import ReportModel from "../models/reportModel.js";
import PostModel from "../models/postsModel.js";
import _ from "lodash";
import UserModel from "../models/usersModel.js";

const router = express.Router();

// report post

router.post("/post/:id", [auth, validate(createReport)], async (req, res) => {
  try {
    const postId = req.params.id;
    const { reason } = req.body;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).send("Invalid post ID");
    }

    const reportedPost = await PostModel.findById(postId);

    if (!reportedPost) return res.status(404).send("Post not found");

    const existingReport = await ReportModel.findOne({
      reporter: req.user._id,
      reportedPost: postId,
    });
    if (existingReport)
      return res.status(400).send("You already reported this post");

    const newReport = new ReportModel({
      reporter: req.user._id,
      reportedPost: postId,
      reason,
    });
    await newReport.save();

    return res.status(201).send(newReport);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// report user

router.post("user/:id", [auth, validate(createReport)], async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const reportedUser = await UserModel.findById(userId);

    if (!reportedUser) return res.status(404).send("User not found");

    const existingReport = await ReportModel.findOne({
      reporter: req.user._id,
      reportedUser: userId,
    });
    if (existingReport)
      return res.status(400).send("You already reported this user");

    const newReport = new ReportModel({
      reporter: req.user._id,
      reportedUser: userId,
      reason,
    });
    await newReport.save();

    return res.status(201).send(newReport);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// delete report (admin)

// block user (admin)

// delete post (i have a soft-delete endpoint in Posts.js) (admin)

// add strike (admin)

export default router;
