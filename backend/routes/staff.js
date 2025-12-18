import express from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { StudentAttendance } from "../models/StudentAttendance.js";
import { FeePayment } from "../models/FeePayment.js";
import { FeeStructure } from "../models/FeeStructure.js";

const router = express.Router();

// GET /api/staff/:staffId/profile
router.get('/:staffId/profile', async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await User.findById(staffId).select('-password_hash');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    console.error('STAFF PROFILE ERROR', err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
});

// GET /api/staff/:staffId/students
router.get('/:staffId/students', async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    let filter = { branch_id: staff.branch_id };
    if (staff.classes && staff.classes.length > 0) {
      filter.class = { $in: staff.classes };
    }
    const students = await Student.find(filter).sort({ class: 1, section: 1, rollNo: 1 });
    res.json(students);
  } catch (err) {
    console.error('STAFF STUDENTS ERROR', err);
    res.status(500).json({ message: 'Failed to load students' });
  }
});

// PUT /api/staff/:staffId/students/:studentId  (staff can update student fields except admissionNumber)
router.put('/:staffId/students/:studentId', async (req, res) => {
  try {
    const { staffId, studentId } = req.params;
    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Permission: staff can only edit students in their assigned classes (if any)
    if (staff.classes && staff.classes.length > 0 && !staff.classes.includes(String(student.class))) {
      return res.status(403).json({ message: 'Not authorized to edit this student' });
    }

    const updateData = { ...req.body };
    delete updateData.admissionNumber;
    delete updateData.branch_id;
    delete updateData.institution_id;

    const updated = await Student.findOneAndUpdate({ _id: studentId }, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('STAFF UPDATE STUDENT ERROR', err);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Attendance endpoints
// POST /api/staff/:staffId/attendance  body: { date: '2025-12-18', records: [{ studentId, status }] }
router.post('/:staffId/attendance', async (req, res) => {
  try {
    const { staffId } = req.params;
    const { date, records } = req.body;
    if (!date || !Array.isArray(records)) return res.status(400).json({ message: 'Date and records are required' });

    const attendanceDate = new Date(date);

    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, date: attendanceDate },
        update: { $set: { studentId: r.studentId, staffId, date: attendanceDate, status: r.status } },
        upsert: true
      }
    }));

    await StudentAttendance.bulkWrite(ops);
    res.json({ message: 'Attendance recorded' });
  } catch (err) {
    console.error('ATTENDANCE ERROR', err);
    res.status(500).json({ message: 'Failed to save attendance' });
  }
});

// GET /api/staff/:staffId/attendance?start=&end=
router.get('/:staffId/attendance', async (req, res) => {
  try {
    const { staffId } = req.params;
    const { start, end } = req.query;
    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const filter = { branch_id: staff.branch_id };
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }

    const records = await StudentAttendance.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error('GET ATTENDANCE ERROR', err);
    res.status(500).json({ message: 'Failed to load attendance' });
  }
});

// Reports: simple student filters
// GET /api/staff/:staffId/reports/students?feesDue=true
router.get('/:staffId/reports/students', async (req, res) => {
  try {
    const { staffId } = req.params;
    const { feesDue } = req.query;
    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    let studentFilter = { branch_id: staff.branch_id };
    if (staff.classes && staff.classes.length > 0) studentFilter.class = { $in: staff.classes };

    const students = await Student.find(studentFilter);

    if (feesDue === 'true') {
      // compute due by comparing fee structure total vs paid
      const results = [];
      for (const st of students) {
        const struct = await FeeStructure.findOne({ branch_id: staff.branch_id, class: String(st.class) });
        const structTotal = struct ? Object.values(struct.categories || {}).reduce((s,v)=>s+Number(v||0),0) : 0;
        const paid = await FeePayment.aggregate([
          { $match: { branch_id: staff.branch_id, studentId: st._id } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const paidTotal = paid[0]?.total || 0;
        if (paidTotal < structTotal) results.push({ student: st, due: structTotal - paidTotal });
      }
      return res.json({ results });
    }

    res.json({ students });
  } catch (err) {
    console.error('STAFF REPORT ERROR', err);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

export default router;
