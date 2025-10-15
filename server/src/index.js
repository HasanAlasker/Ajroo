import dotenv from "dotenv";
import express from "express";
import logger from "./middleware/logger.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to mongoDB... ✅"))
  .catch((err) => console.error("Error connecting to mongoDB... ❌", err));


app.use(logger); // my first custom middleware
app.use(express.json());


app.listen(port, () => console.log(`listening to port ${port}`));
