import express from "express";
import mongoose from "mongoose";
import PostModel from "../models/postsModel.js";
import validate from "../middleware/joiValidation.js";
import auth from "../middleware/auth.js";
import _ from "lodash";
import {
  createPostValidation,
  updatePostStatusValidation,
  updatePostValidation,
} from "../validation/postValidation.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// get all posts (admin)
// use pagination

router.get("/", [auth, admin], async (req, res) => {
  try {
    const posts = await PostModel.find();
    if (!posts) return res.status(404).send("No posts found");

    return res.status(200).send(posts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get all posts (authinticatied users)
// use pagination

router.get("/", auth, async (req, res) => {
  try {
    const posts = await PostModel.find({ isDeleted: false });
    if (!posts) return res.status(404).send("No posts found");

    return res.status(200).send(posts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get all requestable posts (authinticatied users)
// use pagination

router.get("/", auth, async (req, res) => {
  try {
    const posts = await PostModel.find({ isDeleted: false, status: ["available", "pending"] });
    if (!posts) return res.status(404).send("No posts found");

    return res.status(200).send(posts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// create post (authinticatied users)
// add (chech subscription limits)

router.post("/", [auth, validate(createPostValidation)], async (req, res) => {
  try {
    const data = _.pick(req.body, [
      "image",
      "name",
      "category",
      "pricePerDay",
      "city",
      "area",
      "condition",
    ]);

    // user id should be set by req.user._id for security reasons
    data.user = req.user._id;

    const newPost = new PostModel(data);
    if (!newPost)
      return res.status(400).send("Post not added, something went wrong");

    const savedPost = await newPost.save();
    return res.status(201).send(savedPost); // just to make sure it sends the saved post
  } catch (err) {
    return res.status(500).send(err.message);
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
      return res.status(500).send(err.message);
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
    return res.status(500).send(err.message);
  }
});

// get the posts of a user (you or others)

router.get("/user/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID");
    }

    const posts = await PostModel.find({ user: id }).sort({ createdAt: -1 });
    if (posts.length === 0) return res.status(404).send("No posts found");

    return res.status(200).send(posts);
  } catch (err) {
    return res.status(500).send(err.message);
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
    return res.status(500).send(err.message);
  }
});

// delete post (admin only)

router.put("/soft-delete/:id", [auth, admin], async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid post ID");
    }

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).send("No posts found");

    if (post.isDeleted) return res.status(400).send("Post already deleted");

    const deletedPost = await PostModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    return res.status(200).send(deletedPost);
  } catch (error) {
    return res.status(500).send(err.message);
  }
});

// Undelete post (admin only)

router.put("/un-delete/:id", [auth, admin], async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid post ID");
    }

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).send("No posts found");

    if (!post.isDeleted) return res.status(400).send("Post already available");

    const deletedPost = await PostModel.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
        deletedAt: null,
      },
      { new: true }
    );

    return res.status(200).send(deletedPost);
  } catch (error) {
    return res.status(500).send(err);
  }
});

// update state ( available /taken )

router.put(
  "/status/:id",
  [auth, validate(updatePostStatusValidation)],
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid post ID");
      }

      const post = await PostModel.findById(id);
      if (!post) return res.status(404).send("Post not found");

      if (req.user._id !== post.user.toString()) {
        return res.status(403).send("Only post owner can change status");
      }

      const data = _.pick(req.body, ["status"]);

      const updatedPost = await PostModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      return res.status(200).send(updatedPost);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
);

// compute rating

// get posts with search and filter, how to do that?

// enforce subscription limits

export default router;
