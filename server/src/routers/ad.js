import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import AdModel from "../models/adModel.js";
import validate from "../middleware/joiValidation.js";
import { createAdSchema } from "../validation/adValidation.js";

const route = express.Router();

// Create ad request

route.post("/create", [auth, validate(createAdSchema)], async (req, res) => {
  try {
    const data = req.body;
    data.user = req.user._id

    const newAd = new AdModel(data);
    if (!newAd) return res.status(400).send("Ad not created, something wrong");

    const savedAd = await newAd.save();
    return res.status(202).send(savedAd);

  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// Aprove ad (admin)

// activate ad (admin)

// deactivate ad (admin)

// edit ad (admin)

// delete ad (admin)

// get all ads

// i need a way to display ads between posts

export default route;
