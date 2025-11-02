import { Router } from "express";
import {
  registerMobileUser,
  verifyEmail,
  resendVerificationCode,
  loginMobileUser,
  getMobileProfile,
  updateMobileProfile,
  changeMobilePassword,
} from "../../../controllers/mobile/mobileUser";
import { authenticateMobile } from "../../../middlewares/auth";
import {
  mobileUserRegistrationSchema,
  mobileUserLoginSchema,
  mobileUserUpdateSchema,
  mobilePasswordChangeSchema,
  emailVerificationSchema,
  resendVerificationSchema,
} from "../../../validations/mobile/mobileUser";
import { validate } from "../../../utils";

const mobileRouter = Router();

mobileRouter.post("/register", validate(mobileUserRegistrationSchema), registerMobileUser);

mobileRouter.post("/verify-email", validate(emailVerificationSchema), verifyEmail);

mobileRouter.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  resendVerificationCode,
);

mobileRouter.post("/login", validate(mobileUserLoginSchema), loginMobileUser);

mobileRouter.use(authenticateMobile);

mobileRouter.get("/profile", getMobileProfile);

mobileRouter.patch("/profile", validate(mobileUserUpdateSchema), updateMobileProfile);

mobileRouter.put("/change-password", validate(mobilePasswordChangeSchema), changeMobilePassword);

export default mobileRouter;
