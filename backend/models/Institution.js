// models/Institution.js
import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    institution_id: { type: String, required: true, unique: true },
    location: { type: String },
    maxBranches: {
      type: Number,
      default: 7,          // company default
      min: 1,
      max: 7               // hard cap at 7
    },
    logo: {
      data: Buffer,
      contentType: String
    }
  },
  { timestamps: true }
);

export const Institution = mongoose.model("Institution", institutionSchema);

// Activity Log Schema - stored at company level
const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "institution_created",
        "institution_updated",
        "institution_deleted",
        "admin_created",
        "admin_updated",
        "admin_deleted",
        "branch_created",
        "branch_updated",
        "branch_deleted"
      ],
      required: true
    },
    description: { type: String, required: true },
    entity: {
      type: String,
      enum: ["institution", "admin", "branch"],
      required: true
    },
    entityId: mongoose.Schema.Types.ObjectId,
    entityName: String,
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution"
    }
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
