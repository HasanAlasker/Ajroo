import express from "express";
import mongoose from "mongoose";
import PostModel from "../models/postsModel.js";
import validate from "../middleware/joiValidation.js";
import auth from "../middleware/auth.js";
import _ from "lodash";
import {
  createPostValidation,
  updatePostValidation,
} from "../validation/postValidation.js";

const router = express.Router();

// get all posts (authinticatied users)

router.get("/", auth, async (req, res) => {
  try {
    const posts = await PostModel.find();
    if (!posts) return res.status(404).send("No posts found");

    return res.status(200).send(posts);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// create post (authinticatied users)

router.post("/", [auth, validate(createPostValidation)], async (req, res) => {
  try {
    const data = _.pick(req.body, [
      "user",
      "image",
      "name",
      "category",
      "pricePerDay",
      "city",
      "area",
      "condition",
    ]);

    const newPost = new PostModel(data);
    if (!newPost)
      return res.status(400).send("Post not added, something went wrong");

    const savedPost = await newPost.save();
    return res.status(201).send(savedPost); // just to make sure it sends the saved post
  } catch (err) {
    return res.status(500).send(err);
  }
});

// edit post (post owner)

router.put(
  "/edit/:id",
  [auth, validate(updatePostValidation)],
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid post ID");
      }

      const post = await PostModel.findById(id);
      if (!post) return res.status(404).send("Post not found");

      if (req.user._id !== post.user.toString()) {
        return res.status(403).send("Only post owner can edit post");
      }

      const data = _.pick(req.body, [
        "image",
        "name",
        "category",
        "pricePerDay",
        "city",
        "area",
        "condition",
      ]);

      const updatedPost = await PostModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      return res.status(200).send(updatedPost);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

// delete post (post owner)

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid post ID");
    }

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).send("Post not found");

    if (req.user._id !== post.user.toString()) {
      return res.status(403).send("Only post owner can delete post");
    }

    const deletedPost = await PostModel.findByIdAndDelete(id);

    return res.status(200).send(deletedPost);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// get post with id (shared post)

router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid post ID");
    }
    
    const post = await PostModel.findById(id);
    if (!post) return res.status(404).send("No posts found");

    return res.status(200).send(post);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// get MY posts (when you open your profile)

// get OTHERS Posts (when you open their profile)

// get posts with search and filter, how to do that?

export default router;
