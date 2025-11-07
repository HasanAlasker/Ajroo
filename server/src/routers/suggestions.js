import express from "express";
import auth from "../middleware/auth";

const router = express.Router();

// create suggesion

router.post("/", auth, async (req, res) => {
  try {
    const suggestion = new Suggestion(req.body);
    await suggestion.save();
    res.status(201).send({ message: "Suggestion submitted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// delete suggestion (admin)

// get all suggestions (admin)

export default router;
