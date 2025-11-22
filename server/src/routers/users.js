import express from "express";
import mongoose from "mongoose";
import _ from "lodash";
import bcrypt from "bcrypt";
import {
  userLoginSchema,
  userRegistrationSchema,
  userUpdateSchema,
} from "../validation/userValidation.js";
import validate from "../middleware/joiValidation.js";
import usersModel from "../models/usersModel.js";
import UserModel from "../models/usersModel.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import SubscriptionModel from "../models/subscriptionModel.js";
import { sendOTPEmail } from "./email.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// get all users (not blocked)

router.get("/", auth, async (req, res) => {
  try {
    const users = await UserModel.find({ isBlocked: false }).select(
      "name role"
    );
    if (!users) return res.status(400).send("No users found");

    return res.status(200).send(users);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// // register

// router.post("/register", validate(userRegistrationSchema), async (req, res) => {
//   try {
//     const user = await usersModel.findOne({ email: req.body.email });
//     if (user) return res.status(400).send("This email is already registered");

//     const newUser = new usersModel(
//       _.pick(req.body, ["_id", "name", "password", "email", "phone", "gender"])
//     );

//     newUser.password = await newUser.hashPassword(req.body.password);

//     await newUser.save();

//     const token = newUser.generateAuthToken();

//     return res
//       .header("x-auth-token", token)
//       .status(200)
//       .send(_.pick(newUser, ["_id", "name", "email", "phone", "gender"]));
//   } catch (err) {
//     if (err.code === 11000) {
//       const field = Object.keys(err.keyValue)[0];
//       return res.status(400).send({
//         message: `${
//           field.charAt(0).toUpperCase() + field.slice(1)
//         } is already in use`,
//       });
//     }
//     return res.status(500).send(err.message);
//   }
// });

// // login

// router.post("/login", validate(userLoginSchema), async (req, res) => {
//   try {
//     const user = await UserModel.findOne({ email: req.body.email });
//     if (!user) return res.status(400).send("Invalid email or password");

//     const validPassword = await bcrypt.compare(
//       req.body.password,
//       user.password
//     );

//     if (!validPassword)
//       return res.status(400).send("Invalid email or password");

//     const token = user.generateAuthToken();

//     return res
//       .status(200)
//       .header("x-auth-token", token)
//       .send(
//         _.pick(user, [
//           "_id",
//           "name",
//           "image",
//           "isRated",
//           "rating",
//           "ratingCount",
//           "gender",
//           "phone",
//           "role",
//         ])
//       );
//     // return res.status(200).send(_.pick(user, ['name', 'email', 'phone', 'gender', 'image', '_id', 'role']))
//   } catch (err) {
//     return res.status(500).send(err.message);
//   }
// });

// Unified error response helper
const createErrorResponse = (message, statusCode = 400) => ({
  success: false,
  message,
});

// register

router.post("/register", validate(userRegistrationSchema), async (req, res) => {
  try {
    const user = await usersModel.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .send(createErrorResponse("Email is already registered"));
    }

    const newUser = new usersModel(
      _.pick(req.body, ["_id", "name", "password", "email", "phone", "gender"])
    );

    newUser.password = await newUser.hashPassword(req.body.password);
    newUser.isVerified = false;

    await newUser.save();

    // Initialize RevenueCat ID
    newUser.revenueCatUserId = newUser._id;
    await newUser.save();

    // Create default free subscription
    const defaultSubscription = new SubscriptionModel({
      userId: newUser._id,
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
    await defaultSubscription.save();

    newUser.subscription = defaultSubscription._id;
    await newUser.save();

    // ✅ NEW: Generate and send OTP automatically
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    newUser.otp = otp;
    newUser.otpExpiry = otpExpiry;
    await newUser.save();

    // Send OTP email (you'll need to import your sendOTPEmail function)
    try {
      await sendOTPEmail(newUser.email, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Still return success but note email failed
    }

    return res.status(200).send({
      success: true,
      message: "Registration successful. Please check your email for OTP.",
      email: newUser.email,
      requiresVerification: true
    });

  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
      return res
        .status(400)
        .send(createErrorResponse(`${fieldName} is already registered`));
    }
    return res
      .status(500)
      .send(createErrorResponse("Registration failed. Please try again"));
  }
});

// login
router.post("/login", validate(userLoginSchema), async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email })
      .populate('subscription'); // Add this to get subscription data
    
    if (!user) {
      return res
        .status(400)
        .send(createErrorResponse("Invalid email or password"));
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res
        .status(400)
        .send(createErrorResponse("Invalid email or password"));
    }

    const token = user.generateAuthToken();

    // Include subscription info in response
    const responseData = {
      ..._.pick(user, [
        "_id",
        "name",
        "image",
        "isRated",
        "rating",
        "ratingCount",
        "gender",
        "phone",
        "role",
        "isBlocked",
        "strikes",
        "revenueCatUserId",
      ]),
      subscription: user.subscription || null,
    };

    return res
      .status(200)
      .header("x-auth-token", token)
      .send(responseData);
  } catch (err) {
    console.error("Login error:", err); // Add logging
    return res
      .status(500)
      .send(createErrorResponse("Login failed. Please try again"));
  }
});

// ==================== PROTECTED ROUTES ====================

// get my profile

router.get("/me", auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    if (!user) return res.status(400).send("user not found");
    if (user.isBlocked) return res.status(404).send("User is Blocked");
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// Get blocked users

router.get("/blocked", [auth, admin], async (req, res) => {
  try {
    const blockedUsers = await UserModel.find({ isBlocked: true }).select(
      "-password"
    );
    return res.status(200).send(blockedUsers);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// get profile by id

router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id).select("-password").populate('subscription', 'productId');
    if (!user) return res.status(404).send("user not found");

    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// edit profile

router.put("/edit/:id", auth, validate(userUpdateSchema), async (req, res) => {
  try {
    const id = req.params.id;

    if (req.user._id !== id)
      return res
        .status(403)
        .send("Forbidden. You can only edit your own profile.");

    const data = _.pick(req.body, [
      "name",
      "password",
      "email",
      "phone",
      "image",
    ]);

    if (data.password) {
      const user = await UserModel.findById(id);
      if (!user) return res.status(404).send("User not found");
      data.password = await user.hashPassword(data.password);
    }

    const updatedUser = await usersModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return res.status(400).send("user not found");

    return res
      .status(200)
      .send(
        _.pick(updatedUser, [
          "name",
          "email",
          "phone",
          "image",
          "_id",
          "gender",
          "rating",
          "ratingCount",
          "role",
        ])
      );
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).send({
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is already in use`,
      });
    }
    return res.status(500).send(err.message);
  }
});

// delete user

router.delete("/delete/:id", [auth, admin], async (req, res) => {
  try {
    const id = req.params.id;

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) return res.status(404).send("user not found");
    return res.status(200).send(_.pick(user, ["_id", "name", "email"]));
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Block user (admin)

router.put("/block/:id", [auth, admin], async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send("User not found");

    if (user.isBlocked) return res.status(400).send("User already blocked");

    user.isBlocked = true;
    user.save();

    return res.status(200).send("User blocked successfully");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// unBlock user (admin)

router.put("/unblock/:id", [auth, admin], async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send("User not found");

    if (user.isBlocked === false)
      return res.status(400).send("User already not blocked");

    user.isBlocked = false;
    user.save();

    return res.status(200).send("User un blocked successfully");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Rate a user

router.put("/rate/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const { rating } = req.body; // Get the rating from request body (1-5)

    // Validate user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).send("Rating must be between 1 and 5");
    }

    // Get current user data
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Calculate new average rating
    const currentTotal = user.rating * user.ratingCount;
    const newRatingCount = user.ratingCount + 1;
    const newAverageRating = (currentTotal + rating) / newRatingCount;

    // Update user with new rating
    const ratedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        rating: newAverageRating,
        ratingCount: newRatingCount,
        isRated: true,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Rating submitted successfully",
      rating: ratedUser.rating,
      ratingCount: ratedUser.ratingCount,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Add push notification token
router.post("/push-token", auth, async (req, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user._id;

    // Validation
    if (!token || !platform) {
      return res.status(400).send("Token and platform are required");
    }

    if (!["ios", "android"].includes(platform)) {
      return res.status(400).send("Platform must be 'ios' or 'android'");
    }

    // Remove old token if it exists (same token, different device)
    await usersModel.findByIdAndUpdate(userId, {
      $pull: {
        pushNotificationTokens: { token: token },
      },
    });

    // Add new token
    const updatedUser = await usersModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          pushNotificationTokens: {
            token: token,
            platform: platform,
            addedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).send("User not found");

    return res.status(200).send({
      message: "Push token added successfully",
      tokens: updatedUser.pushNotificationTokens,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// Remove push notification token (when user logs out on a device)
router.delete("/push-token/:token", auth, async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user._id;

    const updatedUser = await usersModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          pushNotificationTokens: { token: token },
        },
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).send("User not found");

    return res.status(200).send({
      message: "Push token removed successfully",
      tokens: updatedUser.pushNotificationTokens,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// add subscription

// cancel sub

export default router;
