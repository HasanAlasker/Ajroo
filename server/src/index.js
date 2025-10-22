import dotenv from "dotenv";
import express from "express";
import logger from "./middleware/logger.js";
import mongoose from "mongoose";
import cors from "cors";

import users from "./routers/users.js";
import posts from "./routers/posts.js";
import requests from "./routers/requests.js";

dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.log("fatal error no JWT defined");
}

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to mongoDB... ✅"))
  .catch((err) => console.error("Error connecting to mongoDB... ❌", err));

app.use(logger); // my first custom middleware
app.use(express.json());
app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/requests", requests);

app.listen(port, () => {
  console.log(`listening to port ${port} 🖥️`);
  console.log(`Server running on port ${port} 🌍`);
  console.log(`Accessible at http://YOUR_IP:${port} 📌`);
});
