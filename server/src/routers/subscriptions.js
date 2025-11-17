import express from "express";
import SubscriptionModel from "../models/subscriptionModel.js";
import UserModel from "../models/usersModel.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// Get current user's subscription
router.get("/me", auth, async (req, res) => {
  try {
    const subscription = await SubscriptionModel.findOne({
      userId: req.user._id,
    });

    if (!subscription) {
      // Return default free subscription
      return res.status(200).send({
        type: "individual_free",
        status: "active",
        features: {
          maxPosts: 2,
          maxActiveRequests: 3,
          prioritySupport: false,
          analytics: false,
          customBranding: false,
        },
        isActive: true,
      });
    }

    res.status(200).send(subscription);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch subscription", error: error.message });
  }
});

// Initialize RevenueCat user (call this after user registration)
router.post("/init-revenuecat", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate RevenueCat user ID if not exists
    if (!user.revenueCatUserId) {
      user.revenueCatUserId = user._id;
      await user.save();
    }

    // Create default free subscription if not exists
    let subscription = await SubscriptionModel.findOne({ userId: user._id });
    if (!subscription) {
      subscription = new SubscriptionModel({
        userId: user._id,
        type: "individual_free",
        status: "active",
        features: {
          maxPosts: 2,
          maxActiveRequests: 3,
          prioritySupport: false,
          analytics: false,
          customBranding: false,
        },
      });
      await subscription.save();

      user.subscription = subscription._id;
      await user.save();
    }

    res.status(200).send({
      revenueCatUserId: user.revenueCatUserId,
      subscription,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to initialize RevenueCat", error: error.message });
  }
});

// Check if user can perform an action (based on limits)
router.post("/check-limit", auth, async (req, res) => {
  try {
    const { action, currentCount } = req.body;

    const subscription = await SubscriptionModel.getActiveByUserId(req.user._id);

    if (!subscription) {
      // Default free plan limits
      const limits = {
        maxPosts: 2,
        maxActiveRequests: 3,
      };

      const limit = limits[action];
      const canPerform = limit === -1 || currentCount < limit;

      return res.status(200).send({
        canPerform,
        limit,
        currentCount,
        upgradeRequired: !canPerform,
      });
    }

    const canPerform = subscription.canPerformAction(action, currentCount);
    const limit = subscription.features[action];

    res.status(200).send({
      canPerform,
      limit,
      currentCount,
      upgradeRequired: !canPerform,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to check limit", error: error.message });
  }
});

// Get subscription history (admin only)
router.get("/history/:userId", [auth, admin], async (req, res) => {
  try {
    // Only admin or the user themselves can view history
    if (req.user.role !== "admin" && req.user._id !== req.params.userId) {
      return res.status(403).send({ message: "Access denied" });
    }

    const subscriptions = await SubscriptionModel.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.status(200).send(subscriptions);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch history", error: error.message });
  }
});

export default router;