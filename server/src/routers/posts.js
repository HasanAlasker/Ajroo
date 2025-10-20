import express from "express";
import PostModel from "../models/postsModel.js";
import validate from "../middleware/joiValidation.js";
import auth from "../middleware/auth.js";
import _ from "lodash";
import { createPostValidation } from "../validation/postValidation.js";

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
    if (!newPost) return res.status(400).send("Post not added, something went wrong");

    await newPost.save()
    return res.status(200).send(newPost);

  } catch (err) {
    return res.status(500).send(err);
  }
});

// edit post (post owner)

// delete post (post owner)

// get post with id (shared post)

// get posts with search and filter, how to do that?

export default router;
