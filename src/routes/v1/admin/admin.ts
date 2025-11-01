import { Router } from "express";
import {
  registerAdminUser,
  loginAdminUser,
  getAdminProfile,
  updateAdminProfile,
  getAllAdminUsers,
  getAdminUserById,
  updateAdminUserById,
  deleteAdminUser,
  getAdminRolesAndPermissions,
} from "../../../controllers/admin/adminController";
import {
  authenticateAdmin,
  requirePermission,
  requireAnyPermission,
} from "../../../middlewares/auth";
import {
  adminUserRegistrationSchema,
  adminUserLoginSchema,
  adminUserUpdateSchema,
  adminUserQuerySchema,
  adminUserIdParamSchema,
} from "../../../validations/admin/adminUserSchemas";
import { Permission } from "../../../models/admin";
import { validate } from "../../../utils";
import adminSettingsRouter from "./settings/admin";

const adminRouter = Router();

adminRouter.post("/register", validate(adminUserRegistrationSchema), registerAdminUser);

adminRouter.post("/login", validate(adminUserLoginSchema), loginAdminUser);

adminRouter.get("/roles-permissions", getAdminRolesAndPermissions);

adminRouter.use(authenticateAdmin);

adminRouter.get("/profile", getAdminProfile);

adminRouter.put("/profile", validate(adminUserUpdateSchema), updateAdminProfile);

adminRouter.get(
  "/users",
  validate(adminUserQuerySchema, "query"),
  requireAnyPermission([Permission.EDIT_USERS, Permission.DELETE_USERS]),
  getAllAdminUsers,
);

adminRouter.get(
  "/users/:id",
  validate(adminUserIdParamSchema, "params"),
  requireAnyPermission([Permission.EDIT_USERS, Permission.DELETE_USERS]),
  getAdminUserById,
);

adminRouter.put(
  "/users/:id",
  validate(adminUserIdParamSchema, "params"),
  requirePermission(Permission.EDIT_USERS),
  validate(adminUserUpdateSchema),
  updateAdminUserById,
);

adminRouter.delete(
  "/users/:id",
  validate(adminUserIdParamSchema, "params"),
  requirePermission(Permission.DELETE_USERS),
  deleteAdminUser,
);

adminRouter.use("/settings", adminSettingsRouter);

export default adminRouter;
