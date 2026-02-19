import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: [true, 'Please add student ID'],
    unique: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add roll number']
  },
  firstName: {
    type: String,
    required: [true, 'Please add first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add last name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Please specify gender']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  permanentAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  department: {
    type: mongoose.Schema.ObjectId,
    ref: 'Department',
    required: true
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class'
  },
  batch: {
    type: String,
    required: [true, 'Please add batch year']
  },
  semester: {
    type: Number,
    required: [true, 'Please add current semester'],
    min: 1,
    max: 8
  },
  section: {
    type: String
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  admissionType: {
    type: String,
    enum: ['regular', 'lateral', 'management'],
    default: 'regular'
  },
  parentInfo: {
    fatherName: { type: String, required: true },
    fatherOccupation: String,
    fatherPhone: String,
    motherName: { type: String, required: true },
    motherOccupation: String,
    motherPhone: String,
    guardianName: String,
    guardianPhone: String,
    guardianRelation: String
  },
  previousEducation: {
    schoolName: String,
    board: String,
    percentage: Number,
    yearOfPassing: Number
  },
  feeStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'pending'
  },
  scholarshipDetails: {
    hasScholarship: { type: Boolean, default: false },
    scholarshipName: String,
    amount: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'dropped', 'suspended'],
    default: 'active'
  },
  documents: [{
    name: String,
    url: String,
    verified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  photo: {
    type: String,
    default: 'default-student.png'
  },
  subjects: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Subject'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
StudentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full name
StudentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Generate student ID
StudentSchema.statics.generateStudentId = async function (batch, department) {
  const count = await this.countDocuments({ batch });
  const deptCode = department.slice(0, 3).toUpperCase();
  return `${batch}${deptCode}${String(count + 1).padStart(4, '0')}`;
};

export default mongoose.model('Student', StudentSchema);
