import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { Student } from "./models/Student.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_ATLAS || "mongodb://127.0.0.1:27017/first-crop_db";

async function createStudentUser() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");

        // Find an existing student record to link (optional, but good for context)
        const studentRecord = await Student.findOne({ name: "Rahul Sharma" });

        if (!studentRecord) {
            console.log("Warning: 'Rahul Sharma' student record not found. Creating user without linking specific student details.");
        }

        const email = "student@ematix.com";
        const password = "Student@123";

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log("User already exists. Updating password...");
        } else {
            console.log("Creating new student user...");
            user = new User({
                name: studentRecord ? studentRecord.name : "Student User",
                email: email,
                role: "student",
                status: "active",
                institution_id: studentRecord?.institution_id,
                branch_id: studentRecord?.branch_id,
                // Add minimal required fields for staff/others validation if any (none for student role in schema logic I added)
            });
        }

        await user.setPassword(password);

        // If it was existing, ensure role is student
        user.role = "student";
        user.active = "active";
        if (studentRecord) {
            user.institution_id = studentRecord.institution_id;
            user.branch_id = studentRecord.branch_id;
            // You might want to store student_id in User model if needed later, but schema doesn't have it yet.
            // For now, names match.
        }

        await user.save();

        console.log("Student User Created Successfully!");
        console.log("Email:", email);
        console.log("Password:", password);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error creating student user:", error);
        process.exit(1);
    }
}

createStudentUser();
