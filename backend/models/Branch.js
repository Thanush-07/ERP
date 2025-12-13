// backend/models/Branch.js
import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema(
  {
    institution_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    branch_name: {
      type: String,
      required: true,
      trim: true,
    },
    address: String,
    location: String,
    managerName: String,
    managerEmail: String,
    contactPhone: String,
    classes: {
      type: [String],
      default: [],
    },
    feesText: {
      type: String,
      default: "",
    },
    logo: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

export const Branch = mongoose.model("Branch", BranchSchema);
