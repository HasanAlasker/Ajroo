// constants/subscriptionLimits.js
export const SUBSCRIPTION_LIMITS = {
  "individual_free": {
    maxPosts: 2,
    name: "Free Plan",
    entitlementId: null
  },
  "pro_monthly:pro": {
    maxPosts: 6,
    name: "Individual - Pro",
    entitlementId: "pro"
  },
  "business_starter:starter": {
    maxPosts: 25,
    name: "Business - Starter",
    entitlementId: "starter"
  },
  "business_premium:premium": {
    maxPosts: -1, // unlimited
    name: "Business - Premium",
    entitlementId: "premium"
  }
};

export const getPostLimit = (planType) => {
  const limit = SUBSCRIPTION_LIMITS[planType]?.maxPosts;
  // If undefined, default to free plan limit
  if (limit === undefined) {
    console.warn(`Unknown plan type: ${planType}, defaulting to free plan`);
    return SUBSCRIPTION_LIMITS["individual_free"].maxPosts;
  }
  return limit;
};

export const canUserPost = (postCount, planType) => {
  const limit = getPostLimit(planType);
  if (limit === -1) return true; // unlimited
  return postCount < limit;
};

// Helper to convert product ID to full subscription type
export const getFullSubscriptionType = (productId) => {
  const mapping = {
    "business_premium": "business_premium:premium",
    "business_starter": "business_starter:starter",
    "pro_monthly": "pro_monthly:pro",
    "individual_free": "individual_free"
  };
  return mapping[productId] || productId;
};

// Helper to get plan type from entitlement ID
export const getPlanTypeFromEntitlement = (entitlementId) => {
  const plan = Object.keys(SUBSCRIPTION_LIMITS).find(
    key => SUBSCRIPTION_LIMITS[key].entitlementId === entitlementId
  );
  return plan || 'individual_free';
};

// Helper to extract base product ID from full subscription type
export const getBaseProductId = (fullType) => {
  return fullType.split(':')[0];
};