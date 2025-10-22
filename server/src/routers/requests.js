import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import PostModel from "../models/postsModel.js";
import RequestModel from "../models/requestsModel.js";
import validate from "../middleware/joiValidation.js";
import { createRequestValidation } from "../validation/requestValidation.js";

const router = express.Router();

// create requests

router.post(
  "/:id",
  [auth, validate(createRequestValidation)],
  async (req, res) => {
    try {
      const id = req.params.id;
      const { requestedStartDate, requestedEndDate } = req.body;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid post ID");
      }

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
        requestedStartDate,
        requestedEndDate,
      });

      const savedRequest = await newRequest.save();
      return res.status(201).send(savedRequest);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

// delete request ( cancel / reject )

// requests i GOT

// requests i SENT

// confirm request ( => borrwow )

export default router;
