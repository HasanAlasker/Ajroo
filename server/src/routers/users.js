import express from "express";
import mongoose from "mongoose";
import _ from "lodash";
import bcrypt from "bcrypt";
import {
  userLoginSchema,
  userRegistrationSchema,
  userUpdateSchema,
} from "../validation/userValidation.js";
import validate from "../middleware/joiValidation.js";
import usersModel from "../models/usersModel.js";
import UserModel from "../models/usersModel.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// get all users (not blocked)

router.get("/", auth, async (req, res) => {
  try {
    const users = await UserModel.find({ isBlocked: false }).select(
      "name role"
    );
    if (!users) return res.status(400).send("No users found");

    return res.status(200).send(users);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// register

router.post("/register", validate(userRegistrationSchema), async (req, res) => {
  try {
    const user = await usersModel.findOne({ email: req.body.email });
    if (user) return res.status(400).send("This email is already registered");

    const newUser = new usersModel(
      _.pick(req.body, ["_id", "name", "password", "email", "phone", "gender"])
    );

    newUser.password = await newUser.hashPassword(req.body.password);

    await newUser.save();

    const token = newUser.generateAuthToken();

    return res
      .header("x-auth-token", token)
      .status(200)
      .send(_.pick(newUser, ["_id", "name", "email", "phone", "gender"]));
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).send({
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is already in use`,
      });
    }
    return res.status(500).send(err.message);
  }
});

// login

router.post("/login", validate(userLoginSchema), async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res.status(400).send("Invalid email or password");

    const token = user.generateAuthToken();

    return res
      .status(200)
      .header("x-auth-token", token)
      .send(
        _.pick(user, [
          "_id",
          "name",
          "image",
          "isRated",
          "rating",
          "ratingCount",
          "gender",
          "phone",
          "role",
        ])
      );
    // return res.status(200).send(_.pick(user, ['name', 'email', 'phone', 'gender', 'image', '_id', 'role']))
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// ==================== PROTECTED ROUTES ====================

// get my profile

router.get("/me", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    if (!user) return res.status(400).send("user not found");
    if (user.isBlocked) return res.status(404).send("User is Blocked");
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// Get blocked users

router.get("/blocked", [auth, admin], async (req, res) => {
  try {
    const blockedUsers = await UserModel.find({ isBlocked: true }).select(
      "-password"
    );
    return res.status(200).send(blockedUsers);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// get profile by id

router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id).select("-password -strikes");
    if (!user) return res.status(404).send("user not found");

    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// edit profile

router.put("/edit/:id", auth, validate(userUpdateSchema), async (req, res) => {
  try {
    const id = req.params.id;

    if (req.user._id !== id)
      return res
        .status(403)
        .send("Forbidden. You can only edit your own profile.");

    const data = _.pick(req.body, [
      "name",
      "password",
      "email",
      "phone",
      "image",
    ]);

    if (data.password) {
      const user = await UserModel.findById(id);
      if (!user) return res.status(404).send("User not found");
      data.password = await user.hashPassword(data.password);
    }

    const updatedUser = await usersModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return res.status(400).send("user not found");

    return res
      .status(200)
      .send(
        _.pick(updatedUser, [
          "name",
          "email",
          "phone",
          "image",
          "_id",
          "gender",
          "rating",
          "ratingCount",
          "role",
        ])
      );
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).send({
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is already in use`,
      });
    }
    return res.status(500).send(err.message);
  }
});

// delete user

router.delete("/delete/:id", [auth, admin], async (req, res) => {
  try {
    const id = req.params.id;

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) return res.status(404).send("user not found");
    return res.status(200).send(_.pick(user, ["_id", "name", "email"]));
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Block user (admin)

router.put("/block/:id", [auth, admin], async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send("User not found");

    if (user.isBlocked) return res.status(400).send("User already blocked");

    user.isBlocked = true;
    user.save();

    return res.status(200).send("User blocked successfully");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// unBlock user (admin)

router.put("/unblock/:id", [auth, admin], async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send("User not found");

    if (user.isBlocked === false) return res.status(400).send("User already not blocked");

    user.isBlocked = false;
    user.save();

    return res.status(200).send("User un blocked successfully");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Rate a user

router.put("/rate/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const { rating } = req.body; // Get the rating from request body (1-5)

    // Validate user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).send("Rating must be between 1 and 5");
    }

    // Get current user data
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Calculate new average rating
    const currentTotal = user.rating * user.ratingCount;
    const newRatingCount = user.ratingCount + 1;
    const newAverageRating = (currentTotal + rating) / newRatingCount;

    // Update user with new rating
    const ratedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        rating: newAverageRating,
        ratingCount: newRatingCount,
        isRated: true,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Rating submitted successfully",
      rating: ratedUser.rating,
      ratingCount: ratedUser.ratingCount,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// forgot password

// add subscription
export default router;
