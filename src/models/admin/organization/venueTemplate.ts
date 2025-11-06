import mongoose, { Document, Schema } from "mongoose";

export interface IVenueTemplate extends Document {
  name: string;
  description?: string;
  includedFeatures: string[];
  defaultPOICategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const venueTemplateSchema = new Schema<IVenueTemplate>(
  {
    name: {
      type: String,
      required: [true, "Venue template name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Venue template name must be at least 2 characters long"],
      maxlength: [100, "Venue template name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    includedFeatures: {
      type: [String],
      default: [],
      validate: {
        validator: function (features: string[]) {
          return features.every(feature => feature.trim().length > 0);
        },
        message: "All included features must be non-empty strings",
      },
    },
    defaultPOICategories: {
      type: [String],
      default: [],
      validate: {
        validator: function (categories: string[]) {
          return categories.every(category => category.trim().length > 0);
        },
        message: "All POI categories must be non-empty strings",
      },
    },
  },
  {
    timestamps: true,
  }
);

venueTemplateSchema.index({ name: 1 });

const VenueTemplate = mongoose.model<IVenueTemplate>("VenueTemplate", venueTemplateSchema);

export default VenueTemplate;

