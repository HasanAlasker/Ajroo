import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    maxLength: 25,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    unique: true,
    lowercase: true,
  },
  age: {
    type: Number,
  },
});

const StudentModel = mongoose.model("Students", studentSchema);
export default StudentModel;
