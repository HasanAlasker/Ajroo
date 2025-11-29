import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import PostModel from "../models/postsModel.js";
import ReportModel from "../models/reportModel.js";
import UserModel from "../models/usersModel.js";
import subscriptionModel from "../models/subscriptionModel.js";
import suggestionModel from "../models/suggestionModel.js";

const router = express.Router();

router.get("/dashboard/stats", [auth, admin], async (req, res) => {
  try {
    // Run all queries in parallel for better performance
    const [
      totalUsers,
      totalAdmins,
      totalPosts,
      activePosts,
      disabledPosts,
      takenItems,
      deletedPosts,
      activeReports,
      blockedUsers,
      totalSubs,
      proSubs,
      starterSubs,
      premiumSubs,
      freeUsers,
      totalSuggestions
    ] = await Promise.all([
      // Count total users (exclude admins)
      UserModel.countDocuments({ role: { $ne: "admin" } }),

      // Count admins
      UserModel.countDocuments({ role: "admin" }),

      // Count all posts
      PostModel.countDocuments(),

      // Count active posts
      PostModel.countDocuments({ status: "available" }),

      // Count disabled posts
      PostModel.countDocuments({ status: "disabled" }),

      // Count taken items
      PostModel.countDocuments({ status: "taken" }),

      // Count deleted by admin items
      PostModel.countDocuments({ isDeleted: true }),

      // Count active reports
      ReportModel.countDocuments(),

      // Count blocked users
      UserModel.countDocuments({ isBlocked: true }),

      // Count total subs
      subscriptionModel.countDocuments({ status: "active" }),

      subscriptionModel.countDocuments({ productId: "pro_monthly:pro" }),

      subscriptionModel.countDocuments({
        productId: "business_starter:starter",
      }),

      subscriptionModel.countDocuments({
        productId: "business_premium:premium",
      }),

      // free users
      subscriptionModel.countDocuments({
        $or: [
          { productId: null },
          { productId: { $exists: false } },
          {
            productId: {
              $nin: [
                "pro_monthly:pro",
                "business_starter:starter",
                "business_premium:premium",
              ],
            },
          },
        ],
      }),

      suggestionModel.countDocuments()
    ]);

    // Return all stats in one response
    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalPosts,
      activePosts,
      disabledPosts,
      takenItems,
      activeReports,
      deletedPosts,
      blockedUsers,
      totalSubs,
      proSubs,
      starterSubs,
      premiumSubs,
      freeUsers,
      totalSuggestions
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).send("Failed to fetch dashboard statistics");
  }
});

export default router;
