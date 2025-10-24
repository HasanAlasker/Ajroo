import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import BorrowModel from "../models/borrowsModel.js";
import { updateBorrowValidation } from "../validation/borrowValidation.js";
import validate from "../middleware/joiValidation.js";

const router = express.Router();

// get all borrows (admin only)

router.get("/", [auth, admin], async (req, res) => {
  try {
    const borrows = await BorrowModel.find();
    if (borrows.length === 0)
      return res.status(404).send("No borrowed items found");

    return res.status(200).send(borrows);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get GIVEN items

router.get("/given", auth, async (req, res) => {
  try {
    const givenItems = await BorrowModel.find({ owner: req.user._id });
    if (givenItems.length === 0)
      return res.status(404).send("You haven't given any items");

    return res.status(200).send(givenItems);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// get TAKEN items

router.get("/taken", auth, async (req, res) => {
  try {
    const takenItems = await BorrowModel.find({ borrower: req.user._id });
    if (takenItems.length === 0)
      return res.status(404).send("You haven't taken any items");

    return res.status(200).send(takenItems);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// borrower mark as returned (PUT), must be confirmed by owner

router.put(
  "/mark-returned/:id",
  [auth, validate(updateBorrowValidation)],
  async (req, res) => {
    try {
      const borrowId = req.params.id;

      if (!borrowId || !mongoose.Types.ObjectId.isValid(borrowId)) {
        return res.status(400).send("Invalid borrow ID");
      }

      const borrowedItem = await BorrowModel.findById(borrowId);
      if (!borrowedItem) return res.status(404).send("Item not found");
      
      if (borrowedItem.status === "completed")
        return res.status(400).send("You already marked item as returned");

      if (req.user._id.toString() !== borrowedItem.borrower.toString())
        return res.status(403).send("You can't return and item you don't have");

      const updatedBorrow = await BorrowModel.findByIdAndUpdate(
        borrowId,
        {
          status: "completed",
        },
        { new: true, runValidators: true }
      );

      return res.status(200).send(updatedBorrow);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
);

// owner mark as confirmed (DELETE)

// rating after confirmation

export default router;
