// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String },

    password_hash: { type: String, required: true },

    role: {
      type: String,
      enum: [
        "company_admin",
        "institution_admin",
        "branch_admin",
        "staff",
        "parent"
      ],
      required: true
    },

    institution_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution"
    },

    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch"
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    resetToken: String,
    resetTokenExpiry: Date
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  this.password_hash = await bcrypt.hash(plain, 10);
};

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password_hash);
};

module.exports = mongoose.model("User", userSchema);
