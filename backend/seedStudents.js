import mongoose from "mongoose";
import dotenv from "dotenv";
import { Student } from "./models/Student.js";
import { Institution } from "./models/Institution.js";
import { Branch } from "./models/Branch.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_ATLAS || "mongodb://127.0.0.1:27017/first-crop_db";

async function seedStudents() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Check if institution and branch exist, if not create them
    let institution = await Institution.findOne({ institution_id: "INST001" });
    if (!institution) {
      institution = new Institution({
        name: "Ematix Public School",
        institution_id: "INST001",
        location: "Main Road, Chennai",
      });
      await institution.save();
      console.log("✅ Created institution");
    }

    let branch = await Branch.findOne({ branch_name: "Ematix - Chrompet" });
    if (!branch) {
      branch = new Branch({
        institution_id: institution._id,
        branch_name: "Ematix - Chrompet",
        address: "Chrompet, Chennai",
        location: "Chrompet",
        managerName: "Branch Manager 1",
        managerEmail: "bm1@ematix.com",
        contactPhone: "9876543210",
        classes: ["LKG", "UKG", "1st Std", "2nd Std"],
        feesText: "LKG:20000, UKG:21000, 1st Std:25000, 2nd Std:26000",
      });
      await branch.save();
      console.log("✅ Created branch");
    }

    // Delete existing students for fresh seeding
    await Student.deleteMany({});
    console.log("✅ Cleared existing students");

    // Create test students for login
    const testStudents = [
      {
        name: "Rahul Sharma",
        class: "1",
        section: "A",
        rollNo: "1",
        parentName: "Vijay Sharma",
        phoneNo: "9876543210",
        address: "123 Main Street, Chrompet, Chennai - 600044",
        registrationNumber: "REG2026001",
        academicYear: "2024/25",
        status: "active",
        dateOfBirth: new Date("2014-05-15"),
        fees: 25000,
        residency: "day-scholar",
        motherName: "Anjali Sharma",
        fatherName: "Vijay Sharma",
        aadharCardNumber: "1234-5678-9012",
        rationCardNumber: "RC-001001",
        customNote: "Test student 1",
      },
      {
        name: "Priya Patel",
        class: "1",
        section: "A",
        rollNo: "2",
        parentName: "Rajesh Patel",
        phoneNo: "9876543211",
        address: "456 Oak Avenue, Chrompet, Chennai - 600044",
        registrationNumber: "REG2026002",
        academicYear: "2024/25",
        status: "active",
        dateOfBirth: new Date("2014-08-22"),
        fees: 25000,
        residency: "hosteller",
        hostelFees: 8000,
        motherName: "Deepa Patel",
        fatherName: "Rajesh Patel",
        aadharCardNumber: "2234-5678-9012",
        rationCardNumber: "RC-001002",
        customNote: "Test student 2",
      },
      {
        name: "Arun Kumar",
        class: "2",
        section: "B",
        rollNo: "1",
        parentName: "Suresh Kumar",
        phoneNo: "9876543212",
        address: "789 Pine Road, Chrompet, Chennai - 600044",
        registrationNumber: "REG2026003",
        academicYear: "2024/25",
        status: "active",
        dateOfBirth: new Date("2013-12-10"),
        fees: 26000,
        residency: "day-scholar",
        motherName: "Ramya Kumar",
        fatherName: "Suresh Kumar",
        aadharCardNumber: "3234-5678-9012",
        rationCardNumber: "RC-001003",
        customNote: "Test student 3",
      },
      {
        name: "Sneha Reddy",
        class: "2",
        section: "B",
        rollNo: "2",
        parentName: "Kiran Reddy",
        phoneNo: "9876543213",
        address: "321 Elm Street, Chrompet, Chennai - 600044",
        registrationNumber: "REG2026004",
        academicYear: "2024/25",
        status: "active",
        dateOfBirth: new Date("2013-09-05"),
        fees: 26000,
        residency: "hosteller",
        hostelFees: 8000,
        motherName: "Kavya Reddy",
        fatherName: "Kiran Reddy",
        aadharCardNumber: "4234-5678-9012",
        rationCardNumber: "RC-001004",
        customNote: "Test student 4",
      },
      {
        name: "Karthik Nair",
        class: "1",
        section: "A",
        rollNo: "3",
        parentName: "Mohan Nair",
        phoneNo: "9876543214",
        address: "654 Cedar Lane, Chrompet, Chennai - 600044",
        registrationNumber: "REG2026005",
        academicYear: "2024/25",
        status: "active",
        dateOfBirth: new Date("2014-03-20"),
        fees: 25000,
        residency: "day-scholar",
        motherName: "Lakshmi Nair",
        fatherName: "Mohan Nair",
        aadharCardNumber: "5234-5678-9012",
        rationCardNumber: "RC-001005",
        customNote: "Test student 5",
      },
    ].map(
      (s) =>
        new Student({
          ...s,
          institution_id: institution._id,
          branch_id: branch._id,
        })
    );

    await Student.insertMany(testStudents);
    console.log("✅ Created 5 test students");

    console.log("\n📚 Test Student Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Name: Rahul Sharma      | Reg: REG2026001 | Phone: 9876543210");
    console.log("2. Name: Priya Patel      | Reg: REG2026002 | Phone: 9876543211");
    console.log("3. Name: Arun Kumar       | Reg: REG2026003 | Phone: 9876543212");
    console.log("4. Name: Sneha Reddy      | Reg: REG2026004 | Phone: 9876543213");
    console.log("5. Name: Karthik Nair     | Reg: REG2026005 | Phone: 9876543214");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding students:", error);
    process.exit(1);
  }
}

seedStudents();
