import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import { RolePermissions, DEFAULT_ROLE_PERMISSIONS, AdminRole } from "../../models/admin/user-management";

const seedRoles = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await dbConnect();
    }

    const roles = Object.values(AdminRole);
    let createdCount = 0;
    let skippedCount = 0;

    for (const role of roles) {
      const existingRole = await RolePermissions.findOne({ role });

      if (existingRole) {
        console.log(`⏭️  Role "${role}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      const rolePermission = new RolePermissions({
        role,
        permissions: DEFAULT_ROLE_PERMISSIONS[role],
        isActive: true,
      });

      await rolePermission.save();
      console.log(`✅ Role "${role}" created successfully with default permissions!`);
      createdCount++;
    }

    console.log("\n📊 Roles Seeding Summary:");
    console.log(`   ✅ Created: ${createdCount} roles`);
    console.log(`   ⏭️  Skipped: ${skippedCount} roles`);
    console.log(`   📋 Total: ${roles.length} roles`);
  } catch (error: any) {
    console.error("❌ Error seeding roles:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedRoles()
    .then(() => {
      console.log("\n✅ Roles seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Roles seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedRoles;

