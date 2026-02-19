import ErrorResponse from '../../utils/errorResponse.js';
import asyncHandler from '../../middleware/async.js';
import Student from '../../models/Student.model.js';
import User from '../../models/User.model.js';

// @desc      Get all students
// @route     GET /api/v1/students
// @access    Private
export const getAllStudents = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let query = {};

  // Filter by department
  if (req.query.department) {
    query.department = req.query.department;
  }

  // Filter by class
  if (req.query.class) {
    query.class = req.query.class;
  }

  // Filter by semester
  if (req.query.semester) {
    query.semester = parseInt(req.query.semester);
  }

  // Filter by batch
  if (req.query.batch) {
    query.batch = req.query.batch;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Search by name, student ID, or email
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { studentId: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { rollNumber: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const total = await Student.countDocuments(query);
  const students = await Student.find(query)
    .populate('department', 'name code')
    .populate('class', 'name section')
    .populate('user', 'name email')
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: students
  });
});

// @desc      Get single student
// @route     GET /api/v1/students/:id
// @access    Private
export const getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id)
    .populate('department', 'name code')
    .populate('class', 'name section room')
    .populate('subjects', 'name code credits')
    .populate('user', 'name email');

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc      Create student
// @route     POST /api/v1/students
// @access    Private/Admin
export const createStudent = asyncHandler(async (req, res, next) => {
  // Create user account first
  const userData = {
    name: `${req.body.firstName} ${req.body.lastName}`,
    email: req.body.email,
    password: req.body.password || 'student123',
    role: 'student',
    phone: req.body.phone
  };

  const user = await User.create(userData);

  // Generate student ID if not provided
  if (!req.body.studentId) {
    req.body.studentId = await Student.generateStudentId(req.body.batch, req.body.department);
  }

  // Create student profile
  req.body.user = user._id;
  const student = await Student.create(req.body);

  res.status(201).json({
    success: true,
    data: student
  });
});

// @desc      Update student
// @route     PUT /api/v1/students/:id
// @access    Private/Admin
export const updateStudent = asyncHandler(async (req, res, next) => {
  let student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc      Delete student
// @route     DELETE /api/v1/students/:id
// @access    Private/Admin
export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Also delete the associated user
  await User.findByIdAndDelete(student.user);
  await student.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get students by class
// @route     GET /api/v1/students/class/:classId
// @access    Private
export const getStudentsByClass = asyncHandler(async (req, res, next) => {
  const students = await Student.find({
    class: req.params.classId,
    status: 'active'
  })
    .populate('department', 'name code')
    .sort('rollNumber');

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc      Get students by department
// @route     GET /api/v1/students/department/:departmentId
// @access    Private
export const getStudentsByDepartment = asyncHandler(async (req, res, next) => {
  const students = await Student.find({
    department: req.params.departmentId,
    status: 'active'
  })
    .populate('class', 'name section')
    .sort('semester rollNumber');

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc      Update student status
// @route     PUT /api/v1/students/:id/status
// @access    Private/Admin
export const updateStudentStatus = asyncHandler(async (req, res, next) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Update user active status
  await User.findByIdAndUpdate(student.user, {
    isActive: req.body.status === 'active'
  });

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc      Promote students to next semester
// @route     PUT /api/v1/students/promote
// @access    Private/Admin
export const promoteStudents = asyncHandler(async (req, res, next) => {
  const { studentIds, newSemester, newClass } = req.body;

  const result = await Student.updateMany(
    { _id: { $in: studentIds } },
    {
      semester: newSemester,
      class: newClass
    }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} students promoted successfully`
  });
});

// @desc      Get student profile (for logged in student)
// @route     GET /api/v1/students/me/profile
// @access    Private/Student
export const getMyProfile = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user: req.user.id })
    .populate('department', 'name code')
    .populate('class', 'name section room')
    .populate('subjects', 'name code credits');

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc      Get student statistics
// @route     GET /api/v1/students/stats
// @access    Private/Admin
export const getStudentStats = asyncHandler(async (req, res, next) => {
  const totalStudents = await Student.countDocuments();
  const activeStudents = await Student.countDocuments({ status: 'active' });
  const graduatedStudents = await Student.countDocuments({ status: 'graduated' });

  // Students by department
  const byDepartment = await Student.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);

  // Students by semester
  const bySemester = await Student.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$semester', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Students by batch
  const byBatch = await Student.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$batch', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      activeStudents,
      graduatedStudents,
      byDepartment,
      bySemester,
      byBatch
    }
  });
});
