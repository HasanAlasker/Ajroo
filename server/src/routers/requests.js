import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import PostModel from "../models/postsModel.js";
import RequestModel from "../models/requestsModel.js";
import BorrowModel from "../models/borrowsModel.js";
import validate from "../middleware/joiValidation.js";
import { createRequestValidation } from "../validation/requestValidation.js";
import { createBorrowValidation } from "../validation/borrowValidation.js";

const router = express.Router();

// create requests

router.post(
  "/:id",
  [auth, validate(createRequestValidation)],
  async (req, res) => {
    try {
      const id = req.params.id;
      const {
        startDate,
        endDate,
        durationUnit,
        durationValue,
        pricePerDay,
        totalPrice,
      } = req.body;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid post ID");
      }

      if (req.user.role === "admin")
        return res.status(400).send("Admins can't request items");

      const post = await PostModel.findById(id);

      if (!post) return res.status(404).send("Post not found");
      if (post.isDeleted) return res.status(400).send("Post is not available");
      if (post.status !== "available")
        return res.status(400).send("Post is not available for rent");

      // Can't request your own item
      if (post.user.toString() === req.user._id.toString())
        return res.status(400).send("You cannot request your own item");

      // Check for overlapping requests
      const existingRequest = await RequestModel.findOne({
        item: id,
        requester: req.user._id,
        status: "pending",
      });
      if (existingRequest)
        return res
          .status(400)
          .send("You already have a pending request for this item");

      const newRequest = new RequestModel({
        item: id,
        requester: req.user._id,
        owner: post.user,
        startDate: new Date(),
        endDate,
        pricePerDay,
        durationUnit,
        durationValue,
        totalPrice,
      });

      const savedRequest = await newRequest.save();
      return res.status(201).send(savedRequest);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
);

// delete request ( cancel / reject )

router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid post ID");
    }

    const request = await RequestModel.findById(id);
    if (!request) return res.status(400).send("Request not found");

    const isRequester =
      req.user._id.toString() === request.requester._id.toString();
    const isOwner = req.user._id.toString() === request.owner._id.toString();

    if (!isRequester && !isOwner) {
      return res.status(403).send("Forbidden");
    }

    const deletedRequest = await RequestModel.findByIdAndDelete(id);
    return res.status(200).send(deletedRequest);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// confirm request ( => borrwow )

router.post(
  "/borrow/:id",
  [auth, validate(createBorrowValidation)],
  async (req, res) => {
    try {
      const requestId = req.params.id;
      const { startDate } = req.body;

      if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).send("Invalid request ID");
      }

      const request = await RequestModel.findById(requestId);
      if (!request) return res.status(404).send("Request not found");

      // Verify the current user is the owner of the post
      if (request.owner.toString() !== req.user._id.toString()) {
        return res.status(403).send("Only the owner can confirm requests");
      }

      // Get the post
      const post = await PostModel.findById(request.item);

      if (!post) return res.status(404).send("Post not found");
      if (post.isDeleted) return res.status(400).send("Post is not available");
      if (post.status !== "available")
        return res.status(400).send("Post is not available for rent");

      // Calculate the end date based on start date and duration
      const borrowStartDate = startDate ? new Date(startDate) : new Date();
      const borrowEndDate = new Date(borrowStartDate); // Simplified - creates a copy
      const pickUpCoolDown = 2; // if you want to change how much extra time for pick up

      if (request.durationUnit === "hour") {
        borrowEndDate.setHours(
          borrowEndDate.getHours() + request.durationValue + pickUpCoolDown
        );
      } else if (request.durationUnit === "day") {
        borrowEndDate.setDate(borrowEndDate.getDate() + request.durationValue);
        borrowEndDate.setHours(borrowEndDate.getHours() + pickUpCoolDown);
      } else if (request.durationUnit === "week") {
        borrowEndDate.setDate(
          borrowEndDate.getDate() + request.durationValue * 7
        );
        borrowEndDate.setHours(borrowEndDate.getHours() + pickUpCoolDown);
      } else if (request.durationUnit === "month") {
        borrowEndDate.setMonth(
          borrowEndDate.getMonth() + request.durationValue
        );
        borrowEndDate.setHours(borrowEndDate.getHours() + pickUpCoolDown);
      }

      // debug logging to verify:
      // console.log("Duration Unit:", request.durationUnit);
      // console.log("Duration Value:", request.durationValue);
      // console.log("Start Date:", borrowStartDate);
      // console.log("End Date:", borrowEndDate);

      // Check for overlapping borrows
      const existingBorrow = await BorrowModel.findOne({
        item: request.item,
        status: "active",
        $or: [
          {
            startDate: { $lte: borrowEndDate },
            endDate: { $gte: borrowStartDate },
          },
        ],
      });

      if (existingBorrow) {
        return res.status(400).send("Item is already booked for these dates");
      }

      const newBorrow = new BorrowModel({
        item: request.item,
        borrower: request.requester,
        owner: request.owner,
        durationValue: request.durationValue,
        durationUnit: request.durationUnit,
        pricePerDay: request.pricePerDay,
        totalPrice: request.totalPrice,
        startDate: borrowStartDate,
        endDate: borrowEndDate,
      });

      const savedBorrow = await newBorrow.save();

      await PostModel.findByIdAndUpdate(request.item, { status: "taken" });

      // Delete all requests for this item when one is confirmed
      await RequestModel.deleteMany({ item: request.item });

      return res.status(201).send(savedBorrow);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
);

// old way of creating borrow

// router.post(
//   "/borrow/:id",
//   [auth, validate(createBorrowValidation)],
//   async (req, res) => {
//     try {
//       const requestId = req.params.id;
//       const { startDate } = req.body;

//       if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
//         return res.status(400).send("Invalid request ID");
//       }

//       const request = await RequestModel.findById(requestId);
//       if (!request) return res.status(404).send("Request not found");

//       // Verify the current user is the owner of the post
//       if (request.owner.toString() !== req.user._id.toString()) {
//         return res.status(403).send("Only the owner can confirm requests");
//       }

//       // Get the post
//       const post = await PostModel.findById(request.item);

//       if (!post) return res.status(404).send("Post not found");
//       if (post.isDeleted) return res.status(400).send("Post is not available");
//       if (post.status !== "available")
//         return res.status(400).send("Post is not available for rent");

//       // Check for overlapping requests
//       const existingBorrow = await BorrowModel.findOne({
//         item: request.item,
//         status: "active",
//         $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
//       });
//       if (existingBorrow) {
//         return res.status(400).send("Item is already booked for these dates");
//       }

//       const newBorrow = new BorrowModel({
//         item: request.item,
//         borrower: request.requester,
//         owner: request.owner,
//         durationValue: request.durationValue,
//         durationUnit: request.durationUnit,
//         pricePerDay: request.pricePerDay,
//         totalPrice: request.totalPrice,
//         startDate: new Date(), // it starts from the time the owner accepts the request
//         endDate, // this should be calculated again now!
//       });

//       const savedBorrow = await newBorrow.save();

//       await PostModel.findByIdAndUpdate(request.item, { status: "taken" });

//       // when the owner confirms one request ,requests on the same post should be deleted!
//       await RequestModel.deleteMany({ item: request.item });
//       return res.status(201).send(savedBorrow);
//     } catch (err) {
//       return res.status(500).send(err.message);
//     }
//   }
// );

// requests i GOT

router.get("/got", auth, async (req, res) => {
  try {
    const requests = await RequestModel.find({ owner: req.user._id })
      .populate("requester", "name image isBlocked")
      .populate("item", "image");
    // if(requests.length === 0) return res.status(404).send("You haven't received any requests");
    return res.status(200).send(requests);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// requests i SENT

router.get("/sent", auth, async (req, res) => {
  try {
    const requests = await RequestModel.find({ requester: req.user._id })
      .populate("owner", "name image isBlocked")
      .populate("item", "image");
    // if(requests.length === 0) return res.status(404).send("You haven't sent any requests");
    return res.status(200).send(requests);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get request by id

router.get("/:id", auth, async (req, res) => {
  try {
    const requestId = req.params.id;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).send("Invalid request ID");
    }

    const requestedItem = await RequestModel.findById(requestId);
    if (!requestedItem) return res.status(404).send("Item not found");

    return res.status(200).send(requestedItem);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

export default router;
