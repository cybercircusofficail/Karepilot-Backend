import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import Department from "../../models/admin/user-management/departments";

const seedDepartments = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await dbConnect();
    }

    const departmentsToSeed = [
      {
        name: "ICU",
        description: "Intensive Care Unit - Provides critical care for seriously ill patients",
      },
      {
        name: "Emergency",
        description: "Emergency Department - Handles urgent medical cases and trauma",
      },
      {
        name: "Pharmacy",
        description: "Pharmacy Department - Manages medications and prescriptions",
      },
      {
        name: "Security",
        description: "Security Department - Ensures safety and security of the facility",
      },
      {
        name: "Administration",
        description: "Administration Department - Handles administrative and management tasks",
      },
      {
        name: "Maintenance",
        description: "Maintenance Department - Maintains facility infrastructure and equipment",
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const deptData of departmentsToSeed) {
      const existingDept = await Department.findOne({ name: deptData.name });

      if (existingDept) {
        console.log(`⏭️  Department "${deptData.name}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      const department = new Department({
        name: deptData.name,
        description: deptData.description,
        isActive: true,
      });

      await department.save();
      console.log(`✅ Department "${deptData.name}" created successfully!`);
      console.log(`   Description: ${deptData.description}`);
      createdCount++;
    }

    console.log("\n📊 Departments Seeding Summary:");
    console.log(`   ✅ Created: ${createdCount} departments`);
    console.log(`   ⏭️  Skipped: ${skippedCount} departments`);
    console.log(`   📋 Total: ${departmentsToSeed.length} departments`);
  } catch (error: any) {
    console.error("❌ Error seeding departments:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedDepartments()
    .then(() => {
      console.log("\n✅ Departments seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Departments seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedDepartments;

