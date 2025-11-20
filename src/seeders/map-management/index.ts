import seedBuildings from "./buildings.seeder";
import seedFloorPlans from "./floorPlans.seeder";
import seedSettings from "./settings.seeder";
import seedMapEditorPOIs from "./mapEditorPOI.seeder";
import seedMapEditorEntrances from "./mapEditorEntrance.seeder";
import seedMapEditorElevators from "./mapEditorElevator.seeder";
import seedMapEditorPaths from "./mapEditorPath.seeder";
import seedMapEditorRestrictedZones from "./mapEditorRestrictedZone.seeder";
import seedMapEditorLabels from "./mapEditorLabel.seeder";
import seedMapEditorMeasurements from "./mapEditorMeasurement.seeder";

const runMapManagementSeeders = async () => {
  try {
    console.log("🌱 Starting Map Management seeders...\n");

    console.log("🏗️  Seeding buildings...");
    await seedBuildings();
    console.log("");

    console.log("📐 Seeding floor plans...");
    await seedFloorPlans();
    console.log("");

    console.log("📍 Seeding map editor POIs...");
    await seedMapEditorPOIs();
    console.log("");

    console.log("🚪 Seeding map editor entrances...");
    await seedMapEditorEntrances();
    console.log("");

    console.log("🛗 Seeding map editor elevators...");
    await seedMapEditorElevators();
    console.log("");

    console.log("🛤️  Seeding map editor paths...");
    await seedMapEditorPaths();
    console.log("");

    console.log("🚫 Seeding map editor restricted zones...");
    await seedMapEditorRestrictedZones();
    console.log("");

    console.log("🏷️  Seeding map editor labels...");
    await seedMapEditorLabels();
    console.log("");

    console.log("📏 Seeding map editor measurements...");
    await seedMapEditorMeasurements();
    console.log("");

    console.log("⚙️  Seeding settings...");
    await seedSettings();

    console.log("\n✅ All Map Management seeders completed successfully!");
  } catch (error: any) {
    console.error("❌ Error running Map Management seeders:", error.message);
    throw error;
  }
};

if (require.main === module) {
  const dbConnect = require("../../config/dbConnect").default;
  dbConnect()
    .then(() => {
      console.log("");
      return runMapManagementSeeders();
    })
    .then(() => {
      console.log("\n✅ Map Management seeders completed successfully!");
      process.exit(0);
    })
    .catch((error: any) => {
      console.error("\n❌ Map Management seeders failed:", error.message);
      process.exit(1);
    });
}

export default runMapManagementSeeders;
