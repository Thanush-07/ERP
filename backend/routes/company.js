// routes/company.js
const express = require("express");
const mongoose = require("mongoose");

const Institution = require("../models/Institution");
const User = require("../models/User");
const Branch = require("../models/Branch");
const Student = require("../models/Student");
const FeePayment = require("../models/FeePayment");

const router = express.Router();

/* ----- DASHBOARD ROUTE ----- */
router.get("/dashboard", async (req, res) => {
  try {
    const { institutionId, branchId } = req.query;

    // optional filters
    const branchFilter = {};
    if (institutionId) branchFilter.institution_id = institutionId;
    if (branchId) branchFilter._id = branchId;

    const [totalInstitutions, totalBranches, branchList, instList] =
      await Promise.all([
        Institution.countDocuments({}),
        Branch.countDocuments(branchFilter),
        Branch.find(branchFilter)
          .populate("institution_id", "name")
          .sort({ createdAt: -1 })
          .limit(50),
        Institution.find({}).select("name")
      ]);

    const branches = (branchList || []).map((b) => ({
      id: b._id,
      name: b.branch_name,
      institutionName: b.institution_id?.name || "",
      institutionId: b.institution_id?._id || null
    }));

    const totals = {
      institutions: totalInstitutions,
      branches: totalBranches,
      students: 0,
      feeCollected: 0
    };

    res.json({
      totals,
      institutions: instList,      // <-- React now sees this
      branches,
      recentActivities: []         // fill later if needed
    });
  } catch (err) {
    console.error("COMPANY DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});



/* ----- INSTITUTIONS CRUD ----- */
router.get("/institutions", async (req, res) => {
  try {
    const list = await Institution.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("GET INSTITUTIONS ERROR:", err);
    res.status(400).json({ message: "Could not load institutions" });
  }
});

router.post("/institutions", async (req, res) => {
  try {
    const inst = new Institution(req.body);
    await inst.save();
    res.status(201).json(inst);
  } catch (err) {
    console.error("CREATE INSTITUTION ERROR:", err);
    res.status(400).json({ message: "Could not create institution" });
  }
});

router.put("/institutions/:id", async (req, res) => {
  try {
    const inst = await Institution.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(inst);
  } catch (err) {
    console.error("UPDATE INSTITUTION ERROR:", err);
    res.status(400).json({ message: "Could not update institution" });
  }
});

router.delete("/institutions/:id", async (req, res) => {
  try {
    await Institution.findByIdAndDelete(req.params.id);
    res.json({ message: "Institution deleted" });
  } catch (err) {
    console.error("DELETE INSTITUTION ERROR:", err);
    res.status(400).json({ message: "Could not delete institution" });
  }
});

/* ----- INSTITUTION ADMINS (SUPER ADMINS) CRUD ----- */

// List institution admins
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

// Create institution admin
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

    const populated = await user.populate("institution_id", "name");
    res.status(201).json(populated);
  } catch (err) {
    console.error("CREATE ADMIN ERROR:", err);
    res.status(400).json({ message: err.message || "Could not create admin" });
  }
});

// Update institution admin
router.put("/admins/:id", async (req, res) => {
  try {
    const { name, email, phone, institution_id, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, institution_id, status },
      { new: true }
    ).populate("institution_id", "name");
    res.json(user);
  } catch (err) {
    console.error("UPDATE ADMIN ERROR:", err);
    res.status(400).json({ message: "Could not update admin" });
  }
});

// Delete institution admin
router.delete("/admins/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin deleted" });
  } catch (err) {
    console.error("DELETE ADMIN ERROR:", err);
    res.status(400).json({ message: "Could not delete admin" });
  }
});

/* ----- GLOBAL REPORT (JSON + CSV) ----- */
// GET /api/company/report/global
router.get("/report/global", async (req, res) => {
  try {
    const { institutionId, branchId, format } = req.query;

    const instMatch = institutionId
      ? { institution_id: new mongoose.Types.ObjectId(institutionId) }
      : {};
    const branchMatch = branchId
      ? { branch_id: new mongoose.Types.ObjectId(branchId) }
      : {};

    // institution-wise stats
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

    // branch-wise stats
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

module.exports = router;
