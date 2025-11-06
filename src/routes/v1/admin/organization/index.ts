import { Router } from "express";
import venueTemplateRouter from "./venueTemplate";
import organizationRouter from "./organization";

const router = Router();

router.use("/venue-templates", venueTemplateRouter);

router.use("/", organizationRouter);

export default router;

