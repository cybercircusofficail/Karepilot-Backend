import mongoose, { Schema } from "mongoose";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
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
    passwordResetCode: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpires: {
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
    settings: {
      type: {
        navigationPreferences: {
          stepFreeRouteOnly: {
            type: Boolean,
            default: false,
          },
          largeTouchTargets: {
            type: Boolean,
            default: false,
          },
        },
        languageAndVoice: {
          displayLanguage: {
            type: String,
            default: "English",
            trim: true,
          },
          voiceGuidance: {
            type: Boolean,
            default: false,
          },
        },
        accessibility: {
          voiceNavigation: {
            type: Boolean,
            default: false,
          },
          stepRoutesOnly: {
            type: Boolean,
            default: false,
          },
          largeTextMode: {
            type: Boolean,
            default: false,
          },
        },
      },
      default: {
        navigationPreferences: {
          stepFreeRouteOnly: false,
          largeTouchTargets: false,
        },
        languageAndVoice: {
          displayLanguage: "English",
          voiceGuidance: false,
        },
        accessibility: {
          voiceNavigation: false,
          stepRoutesOnly: false,
          largeTextMode: false,
        },
      },
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
          passwordResetCode,
          passwordResetExpires,
          passwordResetToken,
          passwordResetTokenExpires,
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

mobileUserSchema.methods.generatePasswordResetCode = function (): string {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  this.passwordResetCode = code;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return code;
};

mobileUserSchema.methods.isPasswordResetCodeValid = function (code: string): boolean {
  return (
    this.passwordResetCode === code &&
    this.passwordResetExpires &&
    this.passwordResetExpires > new Date()
  );
};

mobileUserSchema.methods.generatePasswordResetToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  this.passwordResetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); 
  return token;
};

mobileUserSchema.methods.isPasswordResetTokenValid = function (token: string): boolean {
  return (
    this.passwordResetToken === token &&
    this.passwordResetTokenExpires &&
    this.passwordResetTokenExpires > new Date()
  );
};

const MobileUser = mongoose.model<IMobileUser>("MobileUser", mobileUserSchema);

export default MobileUser;
