import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { Student } from "./models/Student.js";
import { Institution } from "./models/Institution.js";
import { Branch } from "./models/Branch.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_ATLAS || "mongodb://127.0.0.1:27017/first-crop_db";

async function seedParents() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Get institution and branch
    const institution = await Institution.findOne({ institution_id: "INST001" });
    const branch = await Branch.findOne({ branch_name: "Ematix - Chrompet" });

    if (!institution || !branch) {
      console.log("❌ Institution or Branch not found. Please run seed:students first");
      process.exit(1);
    }

    // Create parent users
    const parentEmails = [
      { email: "parent1@ematix.com", name: "Vijay Sharma" },
      { email: "parent2@ematix.com", name: "Rajesh Patel" },
      { email: "parent3@ematix.com", name: "Suresh Kumar" },
      { email: "parent4@ematix.com", name: "Kiran Reddy" },
      { email: "parent5@ematix.com", name: "Mohan Nair" },
    ];

    const createdParents = [];

    for (const parentData of parentEmails) {
      let parent = await User.findOne({ email: parentData.email });

      if (!parent) {
        parent = new User({
          name: parentData.name,
          email: parentData.email,
          phone: "9999999999",
          role: "parent",
          status: "active",
          institution_id: institution._id,
          branch_id: branch._id,
        });
        await parent.setPassword("Parent@123");
        await parent.save();
        console.log(`✅ Created parent: ${parentData.name} (${parentData.email})`);
      } else {
        console.log(`⚠️  Parent already exists: ${parentData.email}`);
      }

      createdParents.push(parent);
    }

    // Get all students and link them to parent users
    const students = await Student.find({ status: "active" });

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const parent = createdParents[i % createdParents.length];

      student.parent_id = parent._id;
      await student.save();
      console.log(`✅ Linked student "${student.name}" to parent "${parent.name}"`);
    }

    console.log("\n📚 Test Parent Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    createdParents.forEach((parent, i) => {
      console.log(
        `${i + 1}. Email: ${parent.email} | Password: Parent@123`
      );
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    console.log("✅ Parent seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding parents:", error);
    process.exit(1);
  }
}

seedParents();
