import dbConnect from "../config/dbConnect";
import runUserManagementSeeders from "./user-management/index";
import runOrganizationSeeders from "./organization/index";

const runAllSeeders = async () => {
  try {
    console.log("🌱 Starting database seeders...\n");

    await dbConnect();
    console.log("");

    console.log("👥 Running User Management seeders...");
    await runUserManagementSeeders();
    console.log("");

    console.log("🏢 Running Organization seeders...");
    await runOrganizationSeeders();

    console.log("\n✅ All seeders completed successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error running seeders:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runAllSeeders();
}

export default runAllSeeders;

