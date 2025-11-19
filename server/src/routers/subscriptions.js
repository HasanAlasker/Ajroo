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
      return res.status(200).send({
        subscriptionType: "individual_free",
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
    res.status(500).send({ 
      message: "Failed to fetch subscription", 
      error: error.message 
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
        SubscriptionType: "individual_free",  // Capital S to match schema
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
    res.status(500).send({ 
      message: "Failed to initialize RevenueCat", 
      error: error.message 
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
      originalPurchaseDate 
    } = req.body;

    // console.log("📥 Received subscription update request:", {
    //   subscriptionType,
    //   revenueCatId,
    //   productId,
    //   store,
    //   userId: req.user._id
    // });

    // Validate subscription type
    const validTypes = [
      "individual_free",
      "individual_pro",
      "business_starter", 
      "business_premium"
    ];
    
    if (!subscriptionType || !validTypes.includes(subscriptionType)) {
      console.error("❌ Invalid subscription type:", subscriptionType);
      return res.status(400).send({ 
        message: "Invalid subscription type",
        received: subscriptionType,
        valid: validTypes
      });
    }

    // Define features based on subscription type
    const subscriptionFeatures = {
      individual_free: {
        maxPosts: 2,
        maxActiveRequests: 3,
        prioritySupport: false,
        analytics: false,
        customBranding: false,
      },
      individual_pro: {
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

    // Find existing subscription
    let subscription = await SubscriptionModel.findOne({ 
      userId: req.user._id 
    });

    // console.log("🔍 Found existing subscription:", subscription ? "Yes" : "No");

    if (subscription) {
      // FIXED: Use capital S to match schema
      // console.log("📝 Updating subscription from", subscription.SubscriptionType, "to", subscriptionType);
      
      subscription.SubscriptionType = subscriptionType;  // Changed from .type
      subscription.status = "active";
      subscription.features = subscriptionFeatures[subscriptionType];
      subscription.revenueCatId = revenueCatId;
      subscription.productId = productId;
      subscription.expirationDate = expirationDate;
      subscription.store = store;
      subscription.originalPurchaseDate = originalPurchaseDate || new Date();
      subscription.latestPurchaseDate = new Date();
      subscription.autoRenew = true;
      subscription.willRenew = true;
      
      await subscription.save();
      // console.log("✅ Subscription updated successfully:", subscription.SubscriptionType);
    } else {
      // Create new subscription
      // console.log("📝 Creating new subscription:", subscriptionType);
      
      subscription = new SubscriptionModel({
        userId: req.user._id,
        SubscriptionType: subscriptionType,  // Changed from type
        status: "active",
        features: subscriptionFeatures[subscriptionType],
        revenueCatId,
        productId,
        expirationDate,
        store,
        originalPurchaseDate: originalPurchaseDate || new Date(),
        latestPurchaseDate: new Date(),
        autoRenew: true,
        willRenew: true,
      });
      
      await subscription.save();
      // console.log("✅ Subscription created successfully:", subscription.SubscriptionType);

      // Link subscription to user
      await UserModel.findByIdAndUpdate(req.user._id, {
        subscription: subscription._id,
      });
      // console.log("✅ Subscription linked to user");
    }

    res.status(200).send({
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("❌ Subscription update error:", error);
    res.status(500).send({ 
      message: "Failed to update subscription", 
      error: error.message 
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
      error: error.message 
    });
  }
});

// Restore subscription
router.post("/restore", auth, async (req, res) => {
  try {
    const { 
      revenueCatId, 
      expirationDate,
      subscriptionType 
    } = req.body;

    let subscription = await SubscriptionModel.findOne({
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).send({ 
        message: "No subscription found to restore" 
      });
    }

    const subscriptionFeatures = {
      individual_pro: {
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

    subscription.status = "active";
    subscription.SubscriptionType = subscriptionType;  // Changed from .type
    subscription.features = subscriptionFeatures[subscriptionType];
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
      error: error.message 
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
      error: error.message 
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
      individual_pro: "Pro",
      business_starter: "Starter",
      business_premium: "Premium",
    };

    res.status(200).send({
      subscriptionType: subscription.SubscriptionType,  // Changed from .type
      displayName: displayNames[subscription.SubscriptionType] || "Free Plan",
      status: subscription.status,
    });
  } catch (error) {
    res.status(500).send({ 
      message: "Failed to fetch subscription", 
      error: error.message 
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
      error: error.message 
    });
  }
});

export default router;