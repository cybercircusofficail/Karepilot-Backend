import seedVenueTemplates from "./venueTemplate.seeder";

const runOrganizationSeeders = async () => {
  try {
    console.log("🌱 Starting Organization seeders...\n");

    console.log("🏗️  Seeding venue templates...");
    await seedVenueTemplates();

    console.log("\n✅ All Organization seeders completed successfully!");
  } catch (error: any) {
    console.error("❌ Error running Organization seeders:", error.message);
    throw error;
  }
};

if (require.main === module) {
  const dbConnect = require("../../config/dbConnect").default;
  dbConnect()
    .then(() => {
      console.log("");
      return runOrganizationSeeders();
    })
    .then(() => {
      console.log("\n✅ Organization seeders completed successfully!");
      process.exit(0);
    })
    .catch((error: any) => {
      console.error("\n❌ Organization seeders failed:", error.message);
      process.exit(1);
    });
}

export default runOrganizationSeeders;

