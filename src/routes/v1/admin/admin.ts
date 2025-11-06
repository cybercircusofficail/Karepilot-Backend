import { Router } from "express";
import { authenticateAdmin } from "../../../middlewares/auth";
import authRouter from "./auth";
import userManagementRouter from "./user-management";
import adminSettingsRouter from "./settings";
import organizationRouter from "./organization";

const adminRouter = Router();

adminRouter.use("/auth", authRouter);

adminRouter.use(authenticateAdmin);

adminRouter.use("/user-management", userManagementRouter);

adminRouter.use("/settings", adminSettingsRouter);

adminRouter.use("/organization", organizationRouter);

export default adminRouter;
