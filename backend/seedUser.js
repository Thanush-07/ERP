// seedUser.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js";

dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/first-crop_db";

async function createUserIfMissing() {
  await mongoose.connect(MONGO_URL);
  console.log("Mongo connected for seeding");

  const email = "companyadmin@erp.com";

  let user = await User.findOne({ email });
  if (user) {
    console.log("Company admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  user = new User({
    name: "Company Admin",
    email,
    phone: "9999999999",
    role: "company_admin",
    status: "active",
    password_hash: "" // will be set by setPassword()
  });

  await user.setPassword("Admin@123");
  await user.save();

  console.log("Company admin created:", email);
  await mongoose.disconnect();
}

createUserIfMissing()
  .then(() => {
    console.log("Seed finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
