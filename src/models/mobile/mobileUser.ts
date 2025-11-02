import mongoose, { Schema } from "mongoose";
import * as bcrypt from "bcryptjs";
import { IMobileUser, MobileUserStatus } from "../../types/mobile/mobileUser";

const mobileUserSchema = new Schema<IMobileUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters long"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    status: {
      type: String,
      enum: Object.values(MobileUserStatus),
      default: MobileUserStatus.PENDING,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const {
          password,
          emailVerificationCode,
          emailVerificationExpires,
          ...userWithoutSensitive
        } = ret;
        return userWithoutSensitive;
      },
    },
  },
);

mobileUserSchema.index({ status: 1 });
mobileUserSchema.index({ isEmailVerified: 1 });

mobileUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

mobileUserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

mobileUserSchema.methods.generateEmailVerificationCode = function (): string {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  this.emailVerificationCode = code;
  this.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); 
  return code;
};

mobileUserSchema.methods.isEmailVerificationCodeValid = function (code: string): boolean {
  return (
    this.emailVerificationCode === code &&
    this.emailVerificationExpires &&
    this.emailVerificationExpires > new Date()
  );
};

const MobileUser = mongoose.model<IMobileUser>("MobileUser", mobileUserSchema);

export default MobileUser;
