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
import dotenv from "dotenv";
import auth from "../middleware/auth.js";

const router = express.Router();

dotenv.config();

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
      _.pick(req.body, ["name", "password", "email", "phone", "gender"])
    );

    newUser.password = await newUser.hashPassword(req.body.password)

    await newUser.save();

    const token = newUser.generateAuthToken()

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

    const token = user.generateAuthToken()

    return res.status(200).header("x-auth-token", token).send(_.pick(user, "_id"));
    // return res.status(200).send(_.pick(user, ['name', 'email', 'phone', 'gender', 'image', '_id', 'role']))
  } catch (err) {
    return res.status(500).send(err);
  }
});

// edit profile

router.put("/edit/:id", auth, validate(userUpdateSchema), async (req, res) => {
  try {
    const id = req.params.id;
    const data = _.pick(req.body, [
      "name",
      "password",
      "email",
      "phone",
      "image",
    ]);

    if(req.user._id !== id) return res.status(401).send("unauthorized access")

    const user = await usersModel.findByIdAndUpdate(id, data, { new: true });

    if (data.password) {
      data.password = await user.hashPassword(data.password)
    }

    if (!user) return res.status(400).send("not found");

    return res
      .status(200)
      .send(_.pick(user, ["name", "email", "phone", "image", "_id"]));

  } catch (err) {
    return res.status(500).send(err);
  }
});

// delete user

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    if(req.user._id !== id) return res.status(401).send("unauthorized access")
      
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) return res.status(400).send("not found");
    return res.status(200).send(_.pick(user, ["_id", "name", "email"]));
  } catch (err) {
    return res.status(500).send(err);
  }
});

export default router;
