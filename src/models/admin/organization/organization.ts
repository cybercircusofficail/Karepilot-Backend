import mongoose, { Document, Schema } from "mongoose";
import AdminUser from "../user-management/users";
import VenueTemplate from "./venueTemplate";

export enum OrganizationType {
  HOSPITAL = "Hospital",
  CLINIC = "Clinic",
  SHOPPING_MALL = "Shopping Mall",
  OPEN_PLACE = "Open Place",
  OTHER = "Other",
}

export interface IOrganization extends Document {
  organizationType: OrganizationType;
  name: string;
  email: string;
  phone?: string;
  country: string;
  city: string;
  timezone: string;
  address?: string;
  venueTemplate: mongoose.Types.ObjectId;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    organizationType: {
      type: String,
      enum: Object.values(OrganizationType),
      required: [true, "Organization type is required"],
    },
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Organization name must be at least 2 characters long"],
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [100, "Country cannot exceed 100 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    timezone: {
      type: String,
      required: [true, "Timezone is required"],
      trim: true,
      maxlength: [100, "Timezone cannot exceed 100 characters"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    venueTemplate: {
      type: Schema.Types.ObjectId,
      ref: "VenueTemplate",
      required: [true, "Venue template is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

organizationSchema.index({ isActive: 1 });
organizationSchema.index({ organizationType: 1 });
organizationSchema.index({ venueTemplate: 1 });
organizationSchema.index({ email: 1 });

organizationSchema.pre("save", async function (next) {
  if (this.isModified("venueTemplate")) {
    const venueTemplate = await VenueTemplate.findById(this.venueTemplate);
    if (!venueTemplate) {
      return next(new Error("Venue template not found"));
    }
  }
  if (this.isModified("createdBy") && this.createdBy) {
    const user = await AdminUser.findById(this.createdBy);
    if (!user) {
      return next(new Error("Created by user not found"));
    }
  }
  if (this.isModified("updatedBy") && this.updatedBy) {
    const user = await AdminUser.findById(this.updatedBy);
    if (!user) {
      return next(new Error("Updated by user not found"));
    }
  }
  next();
});

organizationSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;
  if (update?.venueTemplate) {
    const venueTemplate = await VenueTemplate.findById(update.venueTemplate);
    if (!venueTemplate) {
      return next(new Error("Venue template not found"));
    }
  }
  if (update?.createdBy) {
    const user = await AdminUser.findById(update.createdBy);
    if (!user) {
      return next(new Error("Created by user not found"));
    }
  }
  if (update?.updatedBy) {
    const user = await AdminUser.findById(update.updatedBy);
    if (!user) {
      return next(new Error("Updated by user not found"));
    }
  }
  next();
});

const Organization = mongoose.model<IOrganization>("Organization", organizationSchema);

export default Organization;
