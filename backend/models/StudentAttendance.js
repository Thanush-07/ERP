import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema({
  institution_id: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, required: true },
  status: { type: String, enum: ["present", "absent"], required: true }
}, { timestamps: true });

export const StudentAttendance = mongoose.model("StudentAttendance", studentAttendanceSchema);
