import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
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
});

const TeacherModel = mongoose.model("Teachers", teacherSchema);
export default TeacherModel;
