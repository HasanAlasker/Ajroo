import express from "express";
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

// get all users

router.get("/", async (req, res) => {
  try {
    const users = await UserModel.find().select("name role");
    if (!users) return res.status(400).send("No users found");

    return res.status(200).send(users);
  } catch (err) {
    return res.status(500).send(err);
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
      .send(_.pick(newUser, ["name", "email", "phone", "gender"]));
  } catch (err) {
    return res.status(500).send(err);
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
          "rating",
          "ratingCount",
          "gender",
          "phone",
          "role",
        ])
      );
    // return res.status(200).send(_.pick(user, ['name', 'email', 'phone', 'gender', 'image', '_id', 'role']))
  } catch (err) {
    return res.status(500).send(err);
  }
});

// ==================== PROTECTED ROUTES ====================

// get my profile

router.get("/me", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    if (!user) return res.status(400).send("user not found");
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// get others profile

router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id).select(
      "role name image email phone rating ratingCount gender"
    );
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
      .send(_.pick(updatedUser, ["name", "email", "phone", "image", "_id", "gender", "rating", "ratingCount", "role"]));
  } catch (err) {
    return res.status(500).send(err);
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
    return res.status(500).send(err);
  }
});

// increment / decrement strikes
// add subscription
// block user (admin only)
// compute rating

export default router;
