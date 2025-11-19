import express from "express";
import crypto from "crypto";
import UserModel from "../models/usersModel.js";
import SubscriptionModel from "../models/subscriptionModel.js";

const router = express.Router();

// Verify RevenueCat webhook signature
const verifyWebhookSignature = (req) => {
  const signature = req.headers["x-revenuecat-signature"];
  if (!signature) return false;

  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("⚠️ REVENUECAT_WEBHOOK_SECRET not configured");
    return false;
  }

  const hmac = crypto.createHmac("sha256", webhookSecret);
  const digest = hmac.update(JSON.stringify(req.body)).digest("hex");

  return signature === digest;
};

// Map RevenueCat product IDs to your subscription types
const mapProductIdToType = (productId) => {
  const mapping = {
    pro_monthly: "individual_pro",
    business_starter: "business_starter",
    business_premium: "business_premium",
  };
  return mapping[productId] || "individual_free";
};

// Map RevenueCat store to your enum
const mapStore = (store) => {
  const mapping = {
    APP_STORE: "app_store",
    PLAY_STORE: "play_store",
    STRIPE: "stripe",
    PROMOTIONAL: "promotional",
  };
  return mapping[store] || "app_store";
};

// Handle subscription creation/renewal
const handleInitialPurchase = async (event) => {
  const {
    app_user_id,
    product_id,
    period_type,
    purchase_date,
    expiration_at_ms,
    store,
    is_trial_period,
  } = event;

  // console.log("🎉 Processing initial purchase for:", app_user_id);

  try {
    // Find user by RevenueCat ID
    const user = await UserModel.findOne({ revenueCatUserId: app_user_id });
    if (!user) {
      console.error("❌ User not found:", app_user_id);
      return;
    }

    // Check if subscription already exists
    let subscription = await SubscriptionModel.findOne({ userId: user._id });

    const subscriptionData = {
      userId: user._id,
      type: mapProductIdToType(product_id),
      status: is_trial_period ? "in_trial" : "active",
      productId: product_id,
      store: mapStore(store),
      revenueCatId: event.id,
      originalPurchaseDate: new Date(purchase_date),
      latestPurchaseDate: new Date(purchase_date),
      expirationDate: expiration_at_ms ? new Date(expiration_at_ms) : null,
      startDate: new Date(purchase_date),
      endDate: expiration_at_ms ? new Date(expiration_at_ms) : null,
      trialEndDate: is_trial_period && expiration_at_ms ? new Date(expiration_at_ms) : null,
      billingPeriod: period_type === "normal" ? "monthly" : "yearly",
      autoRenew: true,
      willRenew: true,
      lastWebhookEvent: event.type,
      lastWebhookDate: new Date(),
      isSandbox: event.environment === "SANDBOX",
    };

    // Set features based on subscription type
    subscriptionData.features = getFeaturesByType(subscriptionData.type);

    if (subscription) {
      // Update existing subscription
      Object.assign(subscription, subscriptionData);
      await subscription.save();
      // console.log("✅ Subscription updated:", subscription._id);
    } else {
      // Create new subscription
      subscription = new SubscriptionModel(subscriptionData);
      await subscription.save();

      // Link subscription to user
      user.subscription = subscription._id;
      await user.save();
      // console.log("✅ New subscription created:", subscription._id);
    }
  } catch (error) {
    console.error("❌ Error handling initial purchase:", error);
  }
};

// Handle subscription renewal
const handleRenewal = async (event) => {
  const { app_user_id, expiration_at_ms, purchase_date } = event;

  // console.log("🔄 Processing renewal for:", app_user_id);

  try {
    const user = await UserModel.findOne({ revenueCatUserId: app_user_id });
    if (!user) return;

    const subscription = await SubscriptionModel.findOne({ userId: user._id });
    if (!subscription) return;

    subscription.status = "active";
    subscription.latestPurchaseDate = new Date(purchase_date);
    subscription.expirationDate = new Date(expiration_at_ms);
    subscription.endDate = new Date(expiration_at_ms);
    subscription.willRenew = true;
    subscription.lastWebhookEvent = event.type;
    subscription.lastWebhookDate = new Date();

    await subscription.save();
    // console.log("✅ Subscription renewed:", subscription._id);
  } catch (error) {
    console.error("❌ Error handling renewal:", error);
  }
};

// Handle subscription cancellation
const handleCancellation = async (event) => {
  const { app_user_id, expiration_at_ms } = event;

  // console.log("❌ Processing cancellation for:", app_user_id);

  try {
    const user = await UserModel.findOne({ revenueCatUserId: app_user_id });
    if (!user) return;

    const subscription = await SubscriptionModel.findOne({ userId: user._id });
    if (!subscription) return;

    subscription.status = "canceled";
    subscription.canceledAt = new Date();
    subscription.autoRenew = false;
    subscription.willRenew = false;
    subscription.endDate = expiration_at_ms ? new Date(expiration_at_ms) : new Date();
    subscription.lastWebhookEvent = event.type;
    subscription.lastWebhookDate = new Date();

    await subscription.save();
    // console.log("✅ Subscription canceled:", subscription._id);
  } catch (error) {
    console.error("❌ Error handling cancellation:", error);
  }
};

// Handle subscription expiration
const handleExpiration = async (event) => {
  const { app_user_id } = event;

  // console.log("⏰ Processing expiration for:", app_user_id);

  try {
    const user = await UserModel.findOne({ revenueCatUserId: app_user_id });
    if (!user) return;

    const subscription = await SubscriptionModel.findOne({ userId: user._id });
    if (!subscription) return;

    subscription.status = "expired";
    subscription.willRenew = false;
    subscription.lastWebhookEvent = event.type;
    subscription.lastWebhookDate = new Date();

    // Downgrade to free plan
    subscription.type = "individual_free";
    subscription.features = getFeaturesByType("individual_free");

    await subscription.save();
    // console.log("✅ Subscription expired:", subscription._id);
  } catch (error) {
    console.error("❌ Error handling expiration:", error);
  }
};

// Get features based on subscription type
const getFeaturesByType = (type) => {
  const features = {
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
      analytics: true,
      customBranding: false,
    },
    business_starter: {
      maxPosts: 25,
      maxActiveRequests: 50,
      prioritySupport: true,
      analytics: true,
      customBranding: true,
    },
    business_premium: {
      maxPosts: -1, // unlimited
      maxActiveRequests: -1,
      prioritySupport: true,
      analytics: true,
      customBranding: true,
    },
  };

  return features[type] || features.individual_free;
};

// Main webhook endpoint
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  // console.log("📨 RevenueCat webhook received");

  // Verify signature (important for production!)
  if (process.env.NODE_ENV === "production") {
    if (!verifyWebhookSignature(req)) {
      console.error("⚠️ Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }
  }

  try {
    // Parse body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const event = body.event;

    // console.log("📋 Event type:", event.type);
    // console.log("👤 App user ID:", event.app_user_id);

    // Handle different event types
    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "NON_RENEWING_PURCHASE":
        await handleInitialPurchase(event);
        break;

      case "RENEWAL":
        await handleRenewal(event);
        break;

      case "CANCELLATION":
      case "UNCANCELLATION":
        await handleCancellation(event);
        break;

      case "EXPIRATION":
        await handleExpiration(event);
        break;

      case "BILLING_ISSUE":
        // Handle billing issues (optional)
        console.log("⚠️ Billing issue for:", event.app_user_id);
        break;

      default:
        console.log("ℹ️ Unhandled event type:", event.type);
    }

    res.status(200).send({ received: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).send({ error: "Webhook processing failed" });
  }
});

export default router;