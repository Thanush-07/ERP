// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import companyRouter from "./routes/company.js";
import authRouter from "./routes/auth.js";
import institutionRouter from "./routes/institution.js";
import branchRouter from "./routes/branch.js";
import inventoryRouter from "./routes/inventory.js";
import staffRouter from "./routes/staff.js";
import parentRouter from "./routes/parent.js";
import busesRouter from "./routes/buses.js";

// -------------------- Config --------------------
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- Middleware --------------------
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// -------------------- MongoDB Connection --------------------


// =======  MongoDB Atlas =======
const MONGO_URL = process.env.MONGO_ATLAS;

if (!MONGO_URL) {
  console.error("❌ MongoDB connection string is missing. Please set MONGO_ATLAS in your .env file.");
  process.exit(1);
}

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// -------------------- Routes --------------------
app.use("/api/company", companyRouter);
app.use("/api/auth", authRouter);
app.use("/api/institution", institutionRouter);
app.use("/api/branch", branchRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/staff", staffRouter);
app.use("/api/parent", parentRouter);
app.use("/api/buses", busesRouter);

// -------------------- Start Server --------------------
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB connected");

    // Optional: log which DB is connected
    console.log(
      "Connected DB:",
      MONGO_URL.includes("mongodb+srv") ? "ATLAS ☁️" : "LOCAL (Compass) 💻"
    );

    app.listen(PORT, () => {
      console.log(`🚀 API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

startServer();
