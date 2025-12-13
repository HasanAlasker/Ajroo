import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import AdModel from "../models/adModel.js";
import validate from "../middleware/joiValidation.js";
import { createAdSchema, updateAdSchema } from "../validation/adValidation.js";
import admin from "../middleware/admin.js";

const route = express.Router();

// get all ads
route.get("/", auth, async (req, res) => {
  try {
    const ads = await AdModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "name image subscription email phone",
        populate: { path: "subscription", select: "productId status" },
      });
    if (!ads) return res.status(404).send("No ads found");

    return res.status(202).send(ads);
  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// get all inactive ads
route.get("/inactive", [auth, admin], async (req, res) => {
  try {
    const ads = await AdModel.find({ isActive: false })
      .sort("-createdAt")
      .populate({
        path: "user",
        select: "name image subscription email phone",
        populate: { path: "subscription", select: "productId status" },
      });
    if (!ads) return res.status(404).send("No ads found");

    return res.status(202).send(ads);
  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// get all inactive ads
route.get("/active", [auth, admin], async (req, res) => {
  try {
    const ads = await AdModel.find({ isActive: true })
      .sort("-createdAt")
      .populate({
        path: "user",
        select: "name image subscription email phone",
        populate: { path: "subscription", select: "productId status" },
      });
    if (!ads) return res.status(404).send("No ads found");

    return res.status(202).send(ads);
  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// get all not approved ads
route.get("/notApproved", [auth, admin], async (req, res) => {
  try {
    const ads = await AdModel.find("-isApproved")
      .sort("-createdAt")
      .populate({
        path: "user",
        select: "name image subscription email phone",
        populate: { path: "subscription", select: "productId status" },
      });
    if (!ads) return res.status(404).send("No ads found");

    return res.status(202).send(ads);
  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// Get user's own ads
route.get("/my-ads", auth, async (req, res) => {
  try {
    const ads = await AdModel.find({ user: req.user._id })
      .sort("-createdAt")
      .populate({
        path: "user",
        select: "name image subscription email phone",
        populate: { path: "subscription", select: "productId status" },
      });

    return res.status(200).json(ads);
  } catch (error) {
    console.error("Error fetching user ads:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create ad request
route.post("/create", [auth, validate(createAdSchema)], async (req, res) => {
  try {
    const data = req.body;
    data.user = req.user._id;

    const newAd = new AdModel(data);
    if (!newAd) return res.status(400).send("Ad not created, something wrong");

    const savedAd = await newAd.save();
    return res.status(201).send(savedAd);
  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// Aprove ad (admin)
route.put("/approve/:id", [auth, admin], async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ad ID");
    }

    const ad = await AdModel.findById(id);
    if (!ad) return res.status(404).send("Ad not found");

    const expiresAt = new Date();
    const daysToAdd = parseInt(ad.displayDuration) || 0;
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);

    const approvedAd = await AdModel.findByIdAndUpdate(
      id,
      {
        isApproved: true,
        expiresAt: expiresAt,
      },
      { new: true, runValidators: true }
    );
    if (!approvedAd)
      return res.status(400).send("Ad not approved, something wrong");

    return res.status(200).send(approvedAd);
  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// activate ad (admin)
route.put("/activate/:id", [auth, admin], async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ad ID");
    }

    const activatedAd = await AdModel.findByIdAndUpdate(
      id,
      {
        isActive: true,
      },
      { new: true, runValidators: true }
    );
    if (!activatedAd)
      return res.status(400).send("Ad not activated, something wrong");

    return res.status(202).send(activatedAd);
  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// deactivate ad (admin)
route.put("/deactivate/:id", [auth, admin], async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ad ID");
    }

    const deactivatedAd = await AdModel.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      { new: true, runValidators: true }
    );
    if (!deactivatedAd)
      return res.status(400).send("Ad not deactivated, something wrong");

    return res.status(200).send(deactivatedAd);
  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// edit ad (admin)
route.put(
  "/edit/:id",
  [auth, admin, validate(updateAdSchema)],
  async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ad ID");
      }

      // Recalculate expiresAt if displayDuration is being updated
      if (data.displayDuration) {
        const expiresAt = new Date();
        const daysToAdd = parseInt(data.displayDuration) || 0;
        expiresAt.setDate(expiresAt.getDate() + daysToAdd);
        data.expiresAt = expiresAt;
      }

      const updatedAd = await AdModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      if (!updatedAd)
        return res.status(400).send("Ad not updated, something wrong");

      return res.status(200).send(updatedAd);
    } catch (error) {
      return res.status(500).send("Server error", error);
    }
  }
);

// delete ad (admin)
route.delete("/delete/:id", [auth, admin], async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ad ID");
    }

    const ad = await AdModel.findById(id);
    if (!ad) return res.status(404).send("Ad not found");

    await deleteImageFromCloudinary(ad.imagePublicId);

    const deletedAd = await AdModel.findByIdAndDelete(id);

    if (!deletedAd)
      return res.status(400).send("Ad not deleted, something wrong");

    return res.status(200).send(deletedAd);
  } catch (error) {
    return res.status(500).send("Server error", error);
  }
});

// i need a way to display ads between posts

export default route;
