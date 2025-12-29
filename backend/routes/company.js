// routes/company.js
import express from "express";
import mongoose from "mongoose";
import multer from "multer";

import { Institution, ActivityLog } from "../models/Institution.js";
import { User } from "../models/User.js";
import { Branch } from "../models/Branch.js";
import { Student } from "../models/Student.js";
import { FeePayment } from "../models/FeePayment.js";

const router = express.Router();

// Helper function to log activity
const logActivity = async (type, description, entity, entityId, entityName, institutionId = null) => {
  try {
    const activity = new ActivityLog({
      type,
      description,
      entity,
      entityId,
      entityName,
      institutionId
    });
    await activity.save();
  } catch (err) {
    console.error("Activity log error:", err);
  }
};

// Multer memory storage (keep file in memory, we put it into Mongo)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ----- DASHBOARD ROUTE ----- */
router.get("/dashboard", async (req, res) => {
  try {
    const { institutionId, branchId } = req.query;

    const branchFilter = {};
    if (institutionId) branchFilter.institution_id = institutionId;
    if (branchId) branchFilter._id = branchId;

    const [totalInstitutions, totalBranches, branchList, instList, activities] =
      await Promise.all([
        Institution.countDocuments({}),
        Branch.countDocuments(branchFilter),
        Branch.find(branchFilter)
          .populate("institution_id", "name")
          .sort({ createdAt: -1 })
          .limit(50),
        Institution.find({}).select("name"),
        ActivityLog.find({})
          .sort({ createdAt: -1 })
          .limit(10)
      ]);

    const branches = (branchList || []).map((b) => ({
      id: b._id,
      name: b.branch_name,
      institutionName: b.institution_id?.name || "",
      institutionId: b.institution_id?._id || null
    }));

    // Format recent activities for display
    const recentActivities = activities.map((a) => ({
      id: a._id,
      description: a.description,
      when: new Date(a.createdAt).toLocaleString(),
      by: a.entity
    }));

    const totals = {
      institutions: totalInstitutions,
      branches: totalBranches,
      students: 0,
      feeCollected: 0
    };

    res.json({
      totals,
      institutions: instList,
      branches,
      recentActivities
    });
  } catch (err) {
    console.error("COMPANY DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----- INSTITUTIONS CRUD ----- */
router.get("/institutions", async (req, res) => {
  try {
    const list = await Institution.find({})
      .select("name institution_id location maxBranches")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("GET INSTITUTIONS ERROR:", err);
    res.status(400).json({ message: "Could not load institutions" });
  }
});

router.post("/institutions", async (req, res) => {
  try {
    const inst = new Institution({
      name: req.body.name,
      institution_id: req.body.institution_id,
      location: req.body.location,
      maxBranches:
        typeof req.body.maxBranches === "number"
          ? req.body.maxBranches
          : 7
    });
    await inst.save();

    // Log activity
    await logActivity(
      "institution_created",
      `Institution "${inst.name}" created`,
      "institution",
      inst._id,
      inst.name
    );

    res.status(201).json(inst);
  } catch (err) {
    console.error("CREATE INSTITUTION ERROR:", err);
    res.status(400).json({ message: "Could not create institution" });
  }
});

router.put("/institutions/:id", async (req, res) => {
  try {
    const inst = await Institution.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        institution_id: req.body.institution_id,
        location: req.body.location,
        maxBranches:
          typeof req.body.maxBranches === "number"
            ? req.body.maxBranches
            : 7
      },
      { new: true }
    );

    // Log activity
    await logActivity(
      "institution_updated",
      `Institution "${inst.name}" updated`,
      "institution",
      inst._id,
      inst.name
    );

    res.json(inst);
  } catch (err) {
    console.error("UPDATE INSTITUTION ERROR:", err);
    res.status(400).json({ message: "Could not update institution" });
  }
});

router.delete("/institutions/:id", async (req, res) => {
  try {
    const inst = await Institution.findById(req.params.id);
    const instName = inst?.name || "Unknown";

    await Institution.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(
      "institution_deleted",
      `Institution "${instName}" deleted`,
      "institution",
      req.params.id,
      instName
    );

    res.json({ message: "Institution deleted" });
  } catch (err) {
    console.error("DELETE INSTITUTION ERROR:", err);
    res.status(400).json({ message: "Could not delete institution" });
  }
});

/* ----- BRANCH CREATE WITH LIMIT ----- */
// POST /api/company/branches
router.post("/branches", async (req, res) => {
  try {
    const { institution_id, branch_name, location } = req.body;

    if (!institution_id || !branch_name) {
      return res
        .status(400)
        .json({ message: "Institution and branch name are required" });
    }

    const inst = await Institution.findById(institution_id).select(
      "maxBranches name"
    );
    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const currentCount = await Branch.countDocuments({ institution_id });
    const limit = inst.maxBranches || 7;

    if (currentCount >= limit) {
      return res.status(400).json({
        message: `Branch limit reached. This institution allows only ${limit} branches.`
      });
    }

    const branch = new Branch({
      institution_id,
      branch_name,
      location
    });
    await branch.save();

    // Log activity
    await logActivity(
      "branch_created",
      `Branch "${branch_name}" created under "${inst.name}"`,
      "branch",
      branch._id,
      branch_name,
      institution_id
    );

    res.status(201).json(branch);
  } catch (err) {
    console.error("CREATE BRANCH ERROR:", err);
    res.status(400).json({ message: "Could not create branch" });
  }
});

/* ----- LOGO UPLOAD (image stored in DB) ----- */
router.post(
  "/institutions/:id/logo",
  upload.single("logo"),
  async (req, res) => {
    try {
      const inst = await Institution.findById(req.params.id);
      if (!inst) {
        return res.status(404).json({ message: "Institution not found" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Logo file is required" });
      }

      inst.logo = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };

      await inst.save();
      res.json({ message: "Logo uploaded" });
    } catch (err) {
      console.error("UPLOAD LOGO ERROR:", err);
      res.status(400).json({ message: "Could not upload logo" });
    }
  }
);

/* ----- LOGO FETCH (serve as image) ----- */
router.get("/institutions/:id/logo", async (req, res) => {
  try {
    const inst = await Institution.findById(req.params.id).select("logo");
    if (!inst || !inst.logo || !inst.logo.data) {
      return res.status(404).send("No logo");
    }

    res.set("Content-Type", inst.logo.contentType || "image/png");
    res.send(inst.logo.data);
  } catch (err) {
    console.error("GET LOGO ERROR:", err);
    res.status(400).send("Error loading logo");
  }
});

/* ----- INSTITUTION ADMINS CRUD ----- */

router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "institution_admin" })
      .populate("institution_id", "name")
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error("GET ADMINS ERROR:", err);
    res.status(400).json({ message: "Could not load admins" });
  }
});

router.post("/admins", async (req, res) => {
  try {
    console.log("CREATE ADMIN BODY:", req.body);

    const { name, email, phone, institution_id } = req.body;

    if (!name || !email || !institution_id) {
      return res
        .status(400)
        .json({ message: "Name, email and institution are required" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const inst = await Institution.findById(institution_id).select("name");

    const user = new User({
      name,
      email,
      phone,
      role: "institution_admin",
      institution_id,
      status: "active",
      password_hash: ""
    });

    await user.setPassword("Admin@123");
    await user.save();

    // Log activity
    await logActivity(
      "admin_created",
      `Admin "${name}" created for "${inst?.name || 'Institution'}"`,
      "admin",
      user._id,
      name,
      institution_id
    );

    const populated = await user.populate("institution_id", "name");
    res.status(201).json(populated);
  } catch (err) {
    console.error("CREATE ADMIN ERROR:", err);
    res.status(400).json({ message: err.message || "Could not create admin" });
  }
});

router.put("/admins/:id", async (req, res) => {
  try {
    const { name, email, phone, institution_id, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, institution_id, status },
      { new: true }
    ).populate("institution_id", "name");

    // Log activity
    await logActivity(
      "admin_updated",
      `Admin "${name}" updated`,
      "admin",
      req.params.id,
      name,
      institution_id
    );

    res.json(user);
  } catch (err) {
    console.error("UPDATE ADMIN ERROR:", err);
    res.status(400).json({ message: "Could not update admin" });
  }
});

router.delete("/admins/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name institution_id");
    const userName = user?.name || "Unknown";
    const instId = user?.institution_id;

    await User.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(
      "admin_deleted",
      `Admin "${userName}" deleted`,
      "admin",
      req.params.id,
      userName,
      instId
    );

    res.json({ message: "Admin deleted" });
  } catch (err) {
    console.error("DELETE ADMIN ERROR:", err);
    res.status(400).json({ message: "Could not delete admin" });
  }
});

/* ----- GLOBAL REPORT (JSON + CSV) ----- */
router.get("/report/global", async (req, res) => {
  try {
    const { institutionId, branchId, format } = req.query;

    const instMatch = institutionId
      ? { institution_id: new mongoose.Types.ObjectId(institutionId) }
      : {};
    const branchMatch = branchId
      ? { branch_id: new mongoose.Types.ObjectId(branchId) }
      : {};

    const [studentInst, staffInst, feeInst, instDocs] = await Promise.all([
      Student.aggregate([
        { $match: instMatch },
        { $group: { _id: "$institution_id", totalStudents: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { ...instMatch, role: "staff" } },
        { $group: { _id: "$institution_id", totalStaff: { $sum: 1 } } }
      ]),
      FeePayment.aggregate([
        { $match: instMatch },
        { $group: { _id: "$institution_id", totalFee: { $sum: "$amount" } } }
      ]),
      Institution.find(institutionId ? { _id: institutionId } : {}).select(
        "name"
      )
    ]);

    const instNameById = new Map(
      instDocs.map((i) => [String(i._id), i.name])
    );

    const instMap = new Map();

    studentInst.forEach((s) => {
      instMap.set(String(s._id), {
        institutionId: s._id,
        students: s.totalStudents,
        staff: 0,
        fee: 0
      });
    });
    staffInst.forEach((st) => {
      const key = String(st._id);
      const row =
        instMap.get(key) || {
          institutionId: st._id,
          students: 0,
          staff: 0,
          fee: 0
        };
      row.staff = st.totalStaff;
      instMap.set(key, row);
    });
    feeInst.forEach((f) => {
      const key = String(f._id);
      const row =
        instMap.get(key) || {
          institutionId: f._id,
          students: 0,
          staff: 0,
          fee: 0
        };
      row.fee = f.totalFee;
      instMap.set(key, row);
    });

    const institutionStats = Array.from(instMap.values()).map((r) => ({
      institutionId: r.institutionId,
      institutionName: instNameById.get(String(r.institutionId)) || "",
      students: r.students,
      staff: r.staff,
      fee: r.fee
    }));

    const branchMatchAll = {
      ...instMatch,
      ...branchMatch
    };

    const [studentBr, staffBr, feeBr, branchDocs] = await Promise.all([
      Student.aggregate([
        { $match: branchMatchAll },
        { $group: { _id: "$branch_id", totalStudents: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { ...branchMatchAll, role: "staff" } },
        { $group: { _id: "$branch_id", totalStaff: { $sum: 1 } } }
      ]),
      FeePayment.aggregate([
        { $match: branchMatchAll },
        { $group: { _id: "$branch_id", totalFee: { $sum: "$amount" } } }
      ]),
        Branch.find(branchMatchAll).select("branch_name institution_id")
    ]);

    const branchNameById = new Map(
      branchDocs.map((b) => [String(b._id), b.branch_name])
    );
    const branchInstById = new Map(
      branchDocs.map((b) => [String(b._id), b.institution_id])
    );

    const brMap = new Map();

    studentBr.forEach((s) => {
      brMap.set(String(s._id), {
        branchId: s._id,
        students: s.totalStudents,
        staff: 0,
        fee: 0
      });
    });
    staffBr.forEach((st) => {
      const key = String(st._id);
      const row =
        brMap.get(key) || {
          branchId: st._id,
          students: 0,
          staff: 0,
          fee: 0
        };
      row.staff = st.totalStaff;
      brMap.set(key, row);
    });
    feeBr.forEach((f) => {
      const key = String(f._id);
      const row =
        brMap.get(key) || {
          branchId: f._id,
          students: 0,
          staff: 0,
          fee: 0
        };
      row.fee = f.totalFee;
      brMap.set(key, row);
    });

    const branchStats = Array.from(brMap.values()).map((r) => ({
      branchId: r.branchId,
      branchName: branchNameById.get(String(r.branchId)) || "",
      institutionId: branchInstById.get(String(r.branchId)) || null,
      students: r.students,
      staff: r.staff,
      fee: r.fee
    }));

    if (format === "csv") {
      const header =
        "Level,InstitutionName,BranchName,Students,Staff,Fee\n";

      const instRows = institutionStats
        .map((i) =>
          [
            "Institution",
            i.institutionName,
            "",
            i.students,
            i.staff,
            i.fee
          ]
            .map((v) => `"${v}"`)
            .join(",")
        )
        .join("\n");

      const brRows = branchStats
        .map((b) =>
          ["Branch", "", b.branchName, b.students, b.staff, b.fee]
            .map((v) => `"${v}"`)
            .join(",")
        )
        .join("\n");

      const csv = header + instRows + (brRows ? "\n" + brRows : "");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=global_report.csv"
      );
      return res.status(200).send(csv);
    }

    res.json({ institutionStats, branchStats });
  } catch (err) {
    console.error("GLOBAL REPORT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
