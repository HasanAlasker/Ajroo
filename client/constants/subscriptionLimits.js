// constants/subscriptionLimits.js
export const SUBSCRIPTION_LIMITS = {
  free: {
    maxPosts: 2,
    name: "Free Plan",
    entitlementId: null
  },
  pro: {
    maxPosts: 6,
    name: "Individual - Pro",
    entitlementId: "pro"
  },
  starter: {
    maxPosts: 25,
    name: "Business - Starter",
    entitlementId: "starter"
  },
  premium: {
    maxPosts: -1, // unlimited
    name: "Business - Premium",
    entitlementId: "premium"
  }
};

export const getPostLimit = (planType) => {
  return SUBSCRIPTION_LIMITS[planType]?.maxPosts ?? SUBSCRIPTION_LIMITS.free.maxPosts;
};

export const canUserPost = (postCount, planType) => {
  const limit = getPostLimit(planType);
  if (limit === -1) return true; // unlimited
  return postCount < limit;
};

// Helper to get plan type from entitlement
export const getPlanTypeFromEntitlement = (entitlementId) => {
  const plan = Object.keys(SUBSCRIPTION_LIMITS).find(
    key => SUBSCRIPTION_LIMITS[key].entitlementId === entitlementId
  );
  return plan || 'free';
};