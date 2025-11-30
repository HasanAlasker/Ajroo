import express from "express";
import SubscriptionModel from "../models/subscriptionModel.js";
import UserModel from "../models/usersModel.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// Helper function to extract base type from product ID
const getBaseSubscriptionType = (subType) => {
  return subType.split(':')[0];
};

// Define subscription features (used across multiple endpoints)
const subscriptionFeatures = {
  individual_free: {
    maxPosts: 2,
    maxActiveRequests: 3,
    prioritySupport: false,
    analytics: false,
    customBranding: false,
  },
  pro_monthly: {
    maxPosts: 6,
    maxActiveRequests: 10,
    prioritySupport: false,
    analytics: false,
    customBranding: false,
  },
  business_starter: {
    maxPosts: 25,
    maxActiveRequests: 20,
    prioritySupport: true,
    analytics: true,
    customBranding: true,
  },
  business_premium: {
    maxPosts: -1,
    maxActiveRequests: -1,
    prioritySupport: true,
    analytics: true,
    customBranding: true,
  },
};

// Get current user's subscription
router.get("/me", auth, async (req, res) => {
  try {
    const subscription = await SubscriptionModel.findOne({
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(200).send({
        subscriptionType: "individual_free",
        status: "active",
        features: subscriptionFeatures.individual_free,
        isActive: true,
      });
    }

    res.status(200).send(subscription);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch subscription",
      error: error.message,
    });
  }
});

// Initialize RevenueCat user
router.post("/init-revenuecat", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (!user.revenueCatUserId) {
      user.revenueCatUserId = user._id.toString();
      await user.save();
    }

    let subscription = await SubscriptionModel.findOne({ userId: user._id });
    if (!subscription) {
      subscription = new SubscriptionModel({
        userId: user._id,
        subscriptionType: "individual_free",
        status: "active",
        features: subscriptionFeatures.individual_free,
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
    res.status(500).send({
      message: "Failed to initialize RevenueCat",
      error: error.message,
    });
  }
});

// Update subscription after RevenueCat purchase
router.post("/update", auth, async (req, res) => {
  try {
    const {
      subscriptionType,
      revenueCatId,
      productId,
      expirationDate,
      store,
      originalPurchaseDate,
    } = req.body;

    const validTypes = [
      "individual_free",
      "pro_monthly:pro",
      "business_starter:starter",
      "business_premium:premium",
    ];

    if (!subscriptionType || !validTypes.includes(subscriptionType)) {
      return res.status(400).send({
        message: "Invalid subscription type",
        received: subscriptionType,
        valid: validTypes,
      });
    }

    const baseType = getBaseSubscriptionType(subscriptionType);

    // ✅ Check for subscription transfer
    const existingSubForDifferentUser = await SubscriptionModel.findOne({
      revenueCatId,
      userId: { $ne: req.user._id }
    });

    if (existingSubForDifferentUser) {
      await SubscriptionModel.deleteOne({ _id: existingSubForDifferentUser._id });
      await UserModel.findByIdAndUpdate(existingSubForDifferentUser.userId, {
        subscription: null
      });
    }

    // ✅ Update/create for current user
    const subscription = await SubscriptionModel.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          subscriptionType,
          status: "active",
          features: subscriptionFeatures[baseType],
          revenueCatId,
          productId,
          expirationDate,
          store,
          originalPurchaseDate: originalPurchaseDate || new Date(),
          latestPurchaseDate: new Date(),
          autoRenew: true,
          willRenew: true,
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    await UserModel.findByIdAndUpdate(req.user._id, {
      subscription: subscription._id,
    });

    res.status(200).send({
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("❌ Subscription update error:", error);
    res.status(500).send({
      message: "Failed to update subscription",
      error: error.message,
    });
  }
});

// Cancel subscription
router.post("/cancel", auth, async (req, res) => {
  try {
    const subscription = await SubscriptionModel.findOne({
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).send({ message: "No active subscription found" });
    }

    subscription.status = "canceled";
    subscription.canceledAt = new Date();
    subscription.willRenew = false;
    subscription.autoRenew = false;

    await subscription.save();

    res.status(200).send({
      message: "Subscription canceled successfully",
      subscription,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
});

// Restore subscription
router.post("/restore", auth, async (req, res) => {
  try {
    const { revenueCatId, expirationDate, subscriptionType } = req.body;

    // Validate subscription type
    const validTypes = [
      "individual_free",
      "pro_monthly:pro",
      "business_starter:starter",
      "business_premium:premium",
    ];

    if (!subscriptionType || !validTypes.includes(subscriptionType)) {
      return res.status(400).send({
        message: "Invalid subscription type",
        received: subscriptionType,
        valid: validTypes,
      });
    }

    let subscription = await SubscriptionModel.findOne({
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).send({
        message: "No subscription found to restore",
      });
    }

    // Get base type for features lookup
    const baseType = getBaseSubscriptionType(subscriptionType);

    subscription.status = "active";
    subscription.subscriptionType = subscriptionType; // Store full ID
    subscription.features = subscriptionFeatures[baseType]; // Use base type
    subscription.revenueCatId = revenueCatId;
    subscription.expirationDate = expirationDate;
    subscription.willRenew = true;
    subscription.autoRenew = true;
    subscription.canceledAt = null;

    await subscription.save();

    res.status(200).send({
      message: "Subscription restored successfully",
      subscription,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to restore subscription",
      error: error.message,
    });
  }
});

// Check if user can perform an action
router.post("/check-limit", auth, async (req, res) => {
  try {
    const { action, currentCount } = req.body;

    const subscription = await SubscriptionModel.getActiveByUserId(
      req.user._id
    );

    if (!subscription) {
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
    res.status(500).send({
      message: "Failed to check limit",
      error: error.message,
    });
  }
});

// Get subscription by user ID
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const subscription = await SubscriptionModel.findOne({
      userId: req.params.userId,
    });

    if (!subscription) {
      return res.status(200).send({
        subscriptionType: "individual_free",
        displayName: "Free Plan",
      });
    }

    const displayNames = {
      individual_free: "Free Plan",
      "pro_monthly:pro": "Pro",
      "business_starter:starter": "Starter",
      "business_premium:premium": "Premium",
    };

    res.status(200).send({
      subscriptionType: subscription.subscriptionType,
      displayName: displayNames[subscription.subscriptionType] || "Free Plan",
      status: subscription.status,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch subscription",
      error: error.message,
    });
  }
});

// Get subscription history (admin only)
router.get("/history/:userId", [auth, admin], async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user._id !== req.params.userId) {
      return res.status(403).send({ message: "Access denied" });
    }

    const subscriptions = await SubscriptionModel.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.status(200).send(subscriptions);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch history",
      error: error.message,
    });
  }
});

// Sync subscription from RevenueCat
router.post("/sync-revenuecat", auth, async (req, res) => {
  try {
    const { 
      subscriptionType, 
      revenueCatId, 
      productId, 
      expirationDate,
      store,
      originalPurchaseDate,
      willRenew,
      autoRenew
    } = req.body;

    const validTypes = [
      "individual_free",
      "pro_monthly:pro",
      "business_starter:starter", 
      "business_premium:premium"
    ];
    
    if (!subscriptionType || !validTypes.includes(subscriptionType)) {
      return res.status(400).send({ 
        message: "Invalid subscription type",
        received: subscriptionType,
        valid: validTypes
      });
    }

    const baseType = getBaseSubscriptionType(subscriptionType);

    // ✅ STEP 1: Check if this revenueCatId exists for a DIFFERENT user
    const existingSubForDifferentUser = await SubscriptionModel.findOne({
      revenueCatId,
      userId: { $ne: req.user._id } // Not equal to current user
    });

    if (existingSubForDifferentUser) {
      console.log(`⚠️ Subscription transfer detected: ${revenueCatId} from user ${existingSubForDifferentUser.userId} to ${req.user._id}`);
      
      // Remove the subscription from the old user
      await SubscriptionModel.deleteOne({ _id: existingSubForDifferentUser._id });
      
      // Reset old user to free plan
      await UserModel.findByIdAndUpdate(existingSubForDifferentUser.userId, {
        subscription: null
      });
      
      console.log(`✅ Old subscription removed from user ${existingSubForDifferentUser.userId}`);
    }

    // ✅ STEP 2: Now safely update/create for current user
    const subscription = await SubscriptionModel.findOneAndUpdate(
      { userId: req.user._id }, // Find by current userId only
      {
        $set: {
          subscriptionType,
          status: subscriptionType === "individual_free" ? "inactive" : "active",
          features: subscriptionFeatures[baseType],
          revenueCatId,
          productId: productId || null,
          expirationDate: expirationDate || null,
          store: store || null,
          originalPurchaseDate: originalPurchaseDate || null,
          latestPurchaseDate: subscriptionType === "individual_free" ? null : new Date(),
          autoRenew: autoRenew || false,
          willRenew: willRenew || false,
        }
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Link to current user
    await UserModel.findByIdAndUpdate(req.user._id, {
      subscription: subscription._id,
    });

    res.status(200).send({
      message: "Subscription synced from RevenueCat successfully",
      subscription,
    });
  } catch (error) {
    console.error("❌ RevenueCat sync error:", error);
    res.status(500).send({ 
      message: "Failed to sync subscription from RevenueCat", 
      error: error.message 
    });
  }
});

export default router;