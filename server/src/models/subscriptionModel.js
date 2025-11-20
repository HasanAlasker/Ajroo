import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Subscription Type - FIXED: Changed to lowercase
    subscriptionType: {  // Changed from SubscriptionType
      type: String,
      enum: [
        "individual_free",
        "individual_pro",
        "business_starter",
        "business_premium",
      ],
      default: "individual_free",
    },

    // Status
    status: {
      type: String,
      enum: [
        "active",
        "canceled",
        "expired",
        "in_trial",
        "past_due",
        "paused",
        "inactive"
      ],
      default: "active",
    },

    // Pricing
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },

    // Dates
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    trialEndDate: {
      type: Date,
    },
    canceledAt: {
      type: Date,
    },

    // RevenueCat Specific Fields
    revenueCatId: {
      type: String,
      unique: true,
      sparse: true,
    },
    originalPurchaseDate: {
      type: Date,
    },
    latestPurchaseDate: {
      type: Date,
    },
    expirationDate: {
      type: Date,
    },
    productId: {
      type: String,
    },
    store: {
      type: String,
      enum: ["app_store", "play_store", "stripe", "promotional"],
    },
    isSandbox: {
      type: Boolean,
      default: false,
    },

    // Billing
    billingPeriod: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    willRenew: {
      type: Boolean,
      default: true,
    },

    // Features/Limits based on plan
    features: {
      maxPosts: {
        type: Number,
        default: 2,
      },
      maxActiveRequests: {
        type: Number,
        default: 3,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      analytics: {
        type: Boolean,
        default: false,
      },
      customBranding: {
        type: Boolean,
        default: false,
      },
    },

    // Webhook/Event tracking
    lastWebhookEvent: {
      type: String,
    },
    lastWebhookDate: {
      type: Date,
    },

    // Metadata
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

// Virtual to check if subscription is active
subscriptionSchema.virtual("isActive").get(function () {
  if (this.status === "canceled" || this.status === "expired") {
    return false;
  }
  if (this.endDate && new Date() > this.endDate) {
    return false;
  }
  return true;
});

// Virtual to check if in trial
subscriptionSchema.virtual("isInTrial").get(function () {
  if (!this.trialEndDate) return false;
  return new Date() < this.trialEndDate;
});

// Virtual to check if will expire soon (within 7 days)
subscriptionSchema.virtual("expiresSoon").get(function () {
  if (!this.endDate) return false;
  const daysUntilExpiry = Math.ceil(
    (this.endDate - new Date()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
});

// Method to check if user has specific feature
subscriptionSchema.methods.hasFeature = function (featureName) {
  return this.features[featureName] === true;
};

// Method to check if user can perform action based on limits
subscriptionSchema.methods.canPerformAction = function (action, currentCount) {
  const limit = this.features[action];
  if (limit === -1) return true;
  return currentCount < limit;
};

// Static method to get active subscription by userId
subscriptionSchema.statics.getActiveByUserId = async function (userId) {
  return this.findOne({
    userId,
    status: { $in: ["active", "in_trial"] },
    $or: [{ endDate: { $gt: new Date() } }, { endDate: null }],
  });
};

// Pre-save hook to update status based on dates
subscriptionSchema.pre("save", function (next) {
  if (this.endDate && new Date() > this.endDate) {
    this.status = "expired";
    this.willRenew = false;
  }
  next();
});

// Ensure virtuals are included in JSON/Object output
subscriptionSchema.set("toJSON", { virtuals: true });
subscriptionSchema.set("toObject", { virtuals: true });

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);
export default SubscriptionModel;