import mongoose from "mongoose";
import PostModel from "../models/postsModel.js";

async function migratePostTypes() {
  try {
    // Connect to database
    await mongoose.connect("put database url here");
    console.log("Connected to database");

    // Update all posts without a type field
    const result = await PostModel.updateMany(
      { type: { $exists: false } },
      { $set: { type: "rent" } }
    );

    console.log(`Migration complete: ${result.modifiedCount} posts updated`);

    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migratePostTypes();
