import { Router } from "express";
import { authenticateAdmin } from "../../../../middlewares/auth";
import { validate } from "../../../../utils";
import {
  getGeneralSettings,
  updateProfileSettings,
  updateUserPreferences,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  updateSecuritySettings,
  changePassword,
} from "../../../../controllers/admin/settings";
import {
  adminProfileUpdateSchema,
  adminPreferencesUpdateSchema,
  adminNotificationSettingsSchema,
  adminSecuritySettingsSchema,
  adminPasswordChangeSchema,
} from "../../../../validations/admin/settings";

const adminSettingsRouter = Router();

adminSettingsRouter.use(authenticateAdmin);

adminSettingsRouter.get("/general", getGeneralSettings);

adminSettingsRouter.put(
  "/general/profile",
  validate(adminProfileUpdateSchema),
  updateProfileSettings,
);

adminSettingsRouter.put(
  "/general/preferences",
  validate(adminPreferencesUpdateSchema),
  updateUserPreferences,
);

adminSettingsRouter.get("/notifications", getNotificationSettings);

adminSettingsRouter.put(
  "/notifications",
  validate(adminNotificationSettingsSchema),
  updateNotificationSettings,
);

adminSettingsRouter.get("/security", getSecuritySettings);

adminSettingsRouter.put("/security", validate(adminSecuritySettingsSchema), updateSecuritySettings);

adminSettingsRouter.put("/security/password", validate(adminPasswordChangeSchema), changePassword);

export default adminSettingsRouter;
