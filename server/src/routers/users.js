import express from "express";
import _ from "lodash";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";
import {
  userLoginSchema,
  userRegistrationSchema,
} from "../validation/userValidation.js";
import validate from "../middleware/joiValidation.js";
import usersModel from "../models/usersModel.js";
import UserModel from "../models/usersModel.js";

const router = express.Router();

// register

router.post("/register", validate(userRegistrationSchema), async (req, res) => {
  try {
    const user = await usersModel.findOne({ email: req.body.email });
    if (user) return res.status(400).send("This email is already registered");

    const newUser = new usersModel(
      _.pick(req.body, ["name", "password", "email", "phone", "gender"])
    );

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    newUser.password = hashPassword;

    await newUser.save();

    return res
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

    const validPassword = await bcrypt.compare(req.body.password, user.password )

    if(!validPassword) return res.status(400).send("Invalid email or password");

    const token = jwt.sign({name: user.name, email: user.email, phone: user.phone, gender: user.gender, _id: user._id, role: user.role}, "e3d5f00120453f0cef0946af3eed5c7f421da013849fbba83107a4a91bde1ec8244ea00f4354cc69cacb490e16e700912305d018c0172734d7708f58261799c0")

    return res.status(200).send(token)
    // return res.status(200).send(_.pick(user, ['name', 'email', 'phone', 'gender', 'image', '_id', 'role']))

  } catch (err) {
    return res.status(500).send(err);
  }
});

// edit profile

export default router;
