import seedRoles from "./roles.seeder";
import seedUsers from "./users.seeder";
import seedDepartments from "./departments.seeder";

const runUserManagementSeeders = async () => {
  try {
    console.log("🌱 Starting User Management seeders...\n");

    console.log("📋 Seeding roles...");
    await seedRoles();
    console.log("");

    console.log("🏢 Seeding departments...");
    await seedDepartments();
    console.log("");

    console.log("👤 Seeding users...");
    await seedUsers();

    console.log("\n✅ All User Management seeders completed successfully!");
  } catch (error: any) {
    console.error("❌ Error running User Management seeders:", error.message);
    throw error;
  }
};

if (require.main === module) {
  const dbConnect = require("../../config/dbConnect").default;
  dbConnect()
    .then(() => {
      console.log("");
      return runUserManagementSeeders();
    })
    .then(() => {
      console.log("\n✅ User Management seeders completed successfully!");
      process.exit(0);
    })
    .catch((error: any) => {
      console.error("\n❌ User Management seeders failed:", error.message);
      process.exit(1);
    });
}

export default runUserManagementSeeders;

