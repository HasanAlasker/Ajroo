import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import PostModel from "../models/postsModel.js";
import ReportModel from "../models/reportModel.js";
import UserModel from "../models/usersModel.js";

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
    //   subscriptionStats,
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
    //   UserModel.countDocuments({ isBlocked: true }),

      // Get subscription breakdown
    //   UserModel.aggregate([
    //     {
    //       $group: {
    //         _id: "$subscriptionTier",
    //         count: { $sum: 1 },
    //       },
    //     },
    //   ]),
    ]);

    // Process subscription stats
    // const subscriptions = {
    //   free: 0,
    //   pro: 0,
    //   businessStarter: 0,
    //   businessPremium: 0,
    // };

    // subscriptionStats.forEach((stat) => {
    //   switch (stat._id) {
    //     case "free":
    //       subscriptions.free = stat.count;
    //       break;
    //     case "pro":
    //       subscriptions.pro = stat.count;
    //       break;
    //     case "business_starter":
    //       subscriptions.businessStarter = stat.count;
    //       break;
    //     case "business_premium":
    //       subscriptions.businessPremium = stat.count;
    //       break;
    //   }
    // });

    // const totalSubscribers =
    //   subscriptions.pro +
    //   subscriptions.businessStarter +
    //   subscriptions.businessPremium;

    // // Calculate profits (example - adjust based on your business logic)
    // const usersProfit = totalSubscribers * 9.99; // Example calculation
    // const appProfit = usersProfit * 0.7; // Example: 70% goes to app

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
    //   usersProfit,
    //   appProfit,
    //   totalSubscribers,
    //   freeUsers: subscriptions.free,
    //   proUsers: subscriptions.pro,
    //   businessStarter: subscriptions.businessStarter,
    //   businessPremium: subscriptions.businessPremium,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).send("Failed to fetch dashboard statistics");
  }
});

export default router;
