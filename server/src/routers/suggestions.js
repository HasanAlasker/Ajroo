import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import SuggestionModel from "../models/suggestionModel.js";
import admin from "../middleware/admin.js";
import UserModel from "../models/usersModel.js";

const router = express.Router();

// create suggesion

router.post("/", auth, async (req, res) => {
  try {
    const { title, type, details } = req.body;
    const suggestion = new SuggestionModel({
      title,
      type,
      details,
      user: req.user,
    });
    await suggestion.save();

    try {
      const admins = await UserModel.find({ role: "admin" });
      const owner = await UserModel.findById(req.user._id);

      const tokens = [];
      admins.forEach((admin) => {
        if (
          admin.pushNotificationTokens &&
          admin.pushNotificationTokens.length > 0
        ) {
          admin.pushNotificationTokens.forEach((tokenObj) => {
            tokens.push(tokenObj.token);
          });
        }
      });

      // Send notification if we have tokens
      if (tokens.length > 0) {
        await sendPushNotification(
          tokens,
          "New Suggestion",
          `${owner.name} made a suggestion or gave feedback!`
        );
        console.log("📤 Notification sent to", tokens.length, "admin(s)");
      } else {
        console.log("⚠️ No admin tokens found");
      }
    } catch (notificationError) {
      console.error("Failed to send push notification:", notificationError);
    }

    res.status(201).send("Suggestion submitted successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// delete suggestion (admin)

router.delete("/delete/:id", [auth, admin], async (req, res) => {
  try {
    const suggestionId = req.params.id;

    if (!suggestionId || !mongoose.Types.ObjectId.isValid(suggestionId)) {
      return res.status(400).send("Invalid suggestion ID");
    }

    const deletedSuggestion = await SuggestionModel.findByIdAndDelete(
      suggestionId
    );
    if (!deletedSuggestion) return res.status(400).send("Suggestion not found");

    res.status(200).send("Suggestion deleted successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get all suggestions (admin)

router.get("/", [auth, admin], async (req, res) => {
  try {
    const suggestions = await SuggestionModel.find()
      .sort("-createdAt")
      .populate("user", "name image email phone");

    res.status(200).send(suggestions);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
