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

// router.get("/", [auth, admin], async (req, res) => {
//   try {
//     const posts = await PostModel.find();
//     if (!posts) return res.status(404).send("No posts found");

//     return res.status(200).send(posts);
//   } catch (err) {
//     return res.status(500).send(err.message);
//   }
// });

// get all posts (authinticatied users)
// use pagination

router.get("/", auth, async (req, res) => {
  try {
    const posts = await PostModel.find({ isDeleted: false })
      .populate("user", "name image")
      .sort("-createdAt");
    if (!posts) return res.status(404).send("No posts found");

    return res.status(200).send(posts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get all requestable posts (authinticatied users)
// use pagination

router.get("/available", auth, async (req, res) => {
  try {
    const posts = await PostModel.find({
      isDeleted: false,
      status: { $in: ["available", "pending"] },
    })
      .populate("user", "name image isBlocked")
      .sort("-createdAt");
    if (!posts) return res.status(404).send("No posts found");

    // Filter out posts from blocked users
    const filteredPosts = posts.filter(
      (post) => post.user && !post.user.isBlocked
    );

    return res.status(200).send(filteredPosts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Get deleted posts (softly)

router.get("/deleted", [auth, admin], async (req, res) => {
  try {
    const deletedPosts = await PostModel.find({ isDeleted: true });
    return res.status(200).send(deletedPosts);
  } catch (err) {
    return res.status(500).send(err);
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

    const posts = await PostModel.find({
      user: id,
      status: { $in: ["available", "disabled"] },
    })
      .sort({ createdAt: -1 })
      .populate("user", "name image");
    if (posts.length === 0) return res.status(404).send("No posts found");

    return res.status(200).send(posts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get posts with search and filter, how to do that?

router.get("/search", auth, async (req, res) => {
  try {
    const {
      category,
      name,
      city,
      area,
      minPrice,
      maxPrice,
      rating,
      condition,
      status,
    } = req.query;

    // Base query - always exclude deleted posts
    let query = { isDeleted: false };

    // Only add status filter if explicitly provided
    // Otherwise, default to available
    if (status) {
      query.status = status;
    } else {
      query.status = "available";
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Name filter (partial match, case-insensitive)
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    // City filter
    if (city) {
      query.city = city;
    }

    // Area filter
    if (area) {
      query.area = area;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    console.log("Backend search query:", query);

    const filteredPosts = await PostModel.find(query)
      .populate("user", "name image")
      .sort("-createdAt");

    console.log("Backend found posts:", filteredPosts.length);

    return res.status(200).send(filteredPosts);
  } catch (err) {
    console.log("Backend search error:", err);
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

// soft-delete post (admin only)

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
  } catch (err) {
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

router.put("/rate/:id", auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { rating } = req.body; // Get the rating from request body (1-5)

    // Validate user ID
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).send("Invalid post ID");
    }

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).send("Rating must be between 1 and 5");
    }

    // Get current user data
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Calculate new average rating
    const currentTotal = post.rating * post.ratingCount;
    const newRatingCount = post.ratingCount + 1;
    const newAverageRating = (currentTotal + rating) / newRatingCount;

    // Update post with new rating
    const ratedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        rating: newAverageRating,
        ratingCount: newRatingCount,
        isRated: true,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Rating submitted successfully",
      rating: ratedPost.rating,
      ratingCount: ratedPost.ratingCount,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// enforce subscription limits

export default router;
