import mongoose from "mongoose";
import dbConnect from "../../config/dbConnect";
import VenueTemplate from "../../models/admin/organization/venueTemplate";

const seedVenueTemplates = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await dbConnect();
    }

    const venueTemplatesToSeed = [
      {
        name: "Hospital Template",
        description: "Healthcare facilities and medical centers",
        includedFeatures: [
          "Emergency tracking",
          "Patient navigation",
          "Equipment monitoring",
          "Staff coordination"
        ],
        defaultPOICategories: [
          "Emergency",
          "Pharmacy",
          "Lab",
          "ICU",
          "Surgery"
        ]
      },
      {
        name: "Airport Template",
        description: "Airports and aviation facilities",
        includedFeatures: [
          "Terminal navigation",
          "Gate tracking",
          "Baggage monitoring",
          "Flight information"
        ],
        defaultPOICategories: [
          "Gates",
          "Security",
          "Baggage",
          "Food Court",
          "Shops"
        ]
      },
      {
        name: "Shopping Mall Template",
        description: "Retail centers and shopping complexes",
        includedFeatures: [
          "Store locator",
          "Event tracking",
          "Customer flow",
          "Promotion zones"
        ],
        defaultPOICategories: [
          "Stores",
          "Food Court",
          "Parking",
          "Restrooms",
          "ATM"
        ]
      },
      {
        name: "Open Place Template",
        description: "Parks, campuses, and public spaces",
        includedFeatures: [
          "Area navigation",
          "Event management",
          "Visitor tracking",
          "Safety zones"
        ],
        defaultPOICategories: [
          "Entrance",
          "Info",
          "Facilities",
          "Events",
          "Emergency"
        ]
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const templateData of venueTemplatesToSeed) {
      const existingTemplate = await VenueTemplate.findOne({ 
        name: { $regex: new RegExp(`^${templateData.name}$`, "i") } 
      });

      if (existingTemplate) {
        console.log(`⏭️  Venue Template "${templateData.name}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      const venueTemplate = new VenueTemplate({
        name: templateData.name,
        description: templateData.description,
        includedFeatures: templateData.includedFeatures,
        defaultPOICategories: templateData.defaultPOICategories,
      });

      await venueTemplate.save();
      console.log(`✅ Venue Template "${templateData.name}" created successfully!`);
      console.log(`   Description: ${templateData.description}`);
      console.log(`   Included Features: ${templateData.includedFeatures.length} features`);
      console.log(`   POI Categories: ${templateData.defaultPOICategories.length} categories`);
      createdCount++;
    }

    console.log("\n📊 Venue Templates Seeding Summary:");
    console.log(`   ✅ Created: ${createdCount} venue templates`);
    console.log(`   ⏭️  Skipped: ${skippedCount} venue templates`);
    console.log(`   📋 Total: ${venueTemplatesToSeed.length} venue templates`);
  } catch (error: any) {
    console.error("❌ Error seeding venue templates:", error.message);
    throw error;
  }
};

if (require.main === module) {
  seedVenueTemplates()
    .then(() => {
      console.log("\n✅ Venue Templates seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Venue Templates seeder failed:", error.message);
      process.exit(1);
    });
}

export default seedVenueTemplates;

