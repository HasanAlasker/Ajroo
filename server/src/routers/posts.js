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
import UserModel from "../models/usersModel.js";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Delete image from Cloudinary
const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

const router = express.Router();

// Helper function to get display name from subscription type
const getSubscriptionDisplayName = (subscriptionType) => {
  if (!subscriptionType) return null;

  const mapping = {
    individual_free: null,
    "pro_monthly:pro": "Pro",
    "business_starter:starter": "Starter",
    "business_premium:premium": "Premium",
  };

  return mapping[subscriptionType] || null;
};

// Helper function to transform posts with subscription data
const transformPostsWithSubscription = (posts) => {
  return posts.map((post) => {
    const postObj = post.toObject();

    // Get subscription display name
    const subscriptionType = postObj.user?.subscription?.type;
    const displayName = getSubscriptionDisplayName(subscriptionType);

    return {
      ...postObj,
      subscriptionDisplayName: displayName,
    };
  });
};

// get all posts (authenticated users)
router.get("/", auth, async (req, res) => {
  try {
    const posts = await PostModel.find({ isDeleted: false })
      .populate({
        path: "user",
        select: "name image subscription email phone",
        populate: {
          path: "subscription",
          select: "productId status",
        },
      })
      .sort("-createdAt");

    if (!posts) return res.status(404).send("No posts found");

    const transformedPosts = transformPostsWithSubscription(posts);
    return res.status(200).send(transformedPosts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get all requestable posts (authenticated users)
router.get("/available", auth, async (req, res) => {
  try {
    const posts = await PostModel.find({
      isDeleted: false,
      status: { $in: ["available", "pending"] },
    })
      .populate({
        path: "user",
        select: "name image isBlocked subscription phone",
        populate: {
          path: "subscription",
          select: "productId status",
        },
      })
      .sort("-createdAt");

    if (!posts) return res.status(404).send("No posts found");

    // Filter out posts from blocked users
    const filteredPosts = posts.filter(
      (post) => post.user && !post.user.isBlocked
    );

    const transformedPosts = transformPostsWithSubscription(filteredPosts);
    return res.status(200).send(transformedPosts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Get deleted posts (softly)
router.get("/deleted", [auth, admin], async (req, res) => {
  try {
    const deletedPosts = await PostModel.find({ isDeleted: true })
      .sort("-createdAt")
      .populate({
        path: "user",
        select: "name image subscription phone",
        populate: {
          path: "subscription",
          select: "productId status",
        },
      });

    const transformedPosts = transformPostsWithSubscription(deletedPosts);
    return res.status(200).send(transformedPosts);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// create post (authenticated users)
router.post("/", [auth, validate(createPostValidation)], async (req, res) => {
  try {
    const data = _.pick(req.body, [
      "image",
      "imagePublicId",
      "name",
      "category",
      "pricePerDay",
      "city",
      "area",
      "condition",
      "type",
      "sellPrice",
      "description",
    ]);

    console.log("recivedData: ", data);

    // user id should be set by req.user._id for security reasons
    data.user = req.user._id;

    const newPost = new PostModel(data);
    if (!newPost)
      return res.status(400).send("Post not added, something went wrong");

    const userId = req.user._id;
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { postCount: 1 },
    });

    const savedPost = await newPost.save();
    console.log("savedPost: ", savedPost);
    return res.status(201).send(savedPost);
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
        "imagePublicId",
        "name",
        "category",
        "pricePerDay",
        "city",
        "area",
        "condition",
        "sellPrice",
        "description",
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

// delete post (post owner/ admin)
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid post ID");
    }

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).send("Post not found");

    if (req.user.role !== "admin" && req.user._id !== post.user.toString()) {
      return res.status(403).send("Only post owner and admins can delete post");
    }

    if (post.imgagePublicId) {
      await deleteImageFromCloudinary(post.imgagePublicId);
    }

    const deletedPost = await PostModel.findByIdAndDelete(id);

    const userId = req.user._id;
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { postCount: -1 },
    });

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
      .populate({
        path: "user",
        select: "name image subscription phone",
        populate: {
          path: "subscription",
          select: "productId status",
        },
      });

    if (posts.length === 0) return res.status(404).send("No posts found");

    const transformedPosts = transformPostsWithSubscription(posts);
    return res.status(200).send(transformedPosts);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get posts with search and filter
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
      type,
      sellPrice,
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

    // Type filter
    if (type) {
      query.type = type;
    }

    // console.log("Backend search query:", query);

    const filteredPosts = await PostModel.find(query)
      .populate({
        path: "user",
        select: "name image subscription phone",
        populate: {
          path: "subscription",
          select: "productId status",
        },
      })
      .sort("-createdAt");

    // console.log("Backend found posts:", filteredPosts.length);

    const transformedPosts = transformPostsWithSubscription(filteredPosts);
    return res.status(200).send(transformedPosts);
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

    const post = await PostModel.findById(id).populate({
      path: "user",
      select: "name image subscription phone",
      populate: {
        path: "subscription",
        select: "productId status",
      },
    });

    if (!post) return res.status(404).send("No posts found");

    const postObj = post.toObject();
    const subscriptionType = postObj.user?.subscription?.subscriptionType;
    const displayName = getSubscriptionDisplayName(subscriptionType);

    return res.status(200).send({
      ...postObj,
      subscriptionDisplayName: displayName,
    });
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
        status: "disabled",
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
        status: "available",
        isDeleted: false,
        deletedAt: null,
      },
      { new: true }
    );

    return res.status(200).send(deletedPost);
  } catch (error) {
    return res.status(500).send(error.message);
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
    const { rating } = req.body;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).send("Invalid post ID");
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).send("Rating must be between 1 and 5");
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    const currentTotal = post.rating * post.ratingCount;
    const newRatingCount = post.ratingCount + 1;
    const newAverageRating = (currentTotal + rating) / newRatingCount;

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

export default router;
