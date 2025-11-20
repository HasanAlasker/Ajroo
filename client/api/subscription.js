import { apiClient } from "./client";

const endPoint = '/api/subscriptions';

// Get current user's subscription
export const getMySubscription = () => apiClient.get(`${endPoint}/me`);

// Initialize RevenueCat user
export const syncRevenueCatId = () => apiClient.post(`${endPoint}/init-revenuecat`);

// Sync subscription data from RevenueCat to database
export const syncSubscriptionFromRevenueCat = (data) => 
  apiClient.post(`${endPoint}/sync-revenuecat`, data);

// Check if user can perform an action (based on limits)
export const checkSubscriptionLimit = (action, currentCount) => 
  apiClient.post(`${endPoint}/check-limit`, { action, currentCount });

// Get subscription history (admin only)
export const getSubscriptionHistory = (userId) => 
  apiClient.get(`${endPoint}/history/${userId}`);

// Update subscription after purchase
export const updateSubscription = (data) => 
  apiClient.post(`${endPoint}/update`, data);

// Cancel subscription
export const cancelSubscription = () => 
  apiClient.post(`${endPoint}/cancel`);

// Restore subscription
export const restoreSubscription = (data) => 
  apiClient.post(`${endPoint}/restore`, data);

// Get subscription by user ID (for badges on posts)
export const getUserSubscription = (userId) =>
  apiClient.get(`${endPoint}/user/${userId}`);


