import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema({
  institution_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  categories: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

export const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
