// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const companyRoutes = require("./routes/company");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URL =
 // process.env.MONGO_URL ||"mongodb+srv://DTW:secret123@cluster0.vwhagph.mongodb.net/DTW?appName=Cluster0";
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/first-crop_db";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
