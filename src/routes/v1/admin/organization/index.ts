import { Router } from "express";
import venueTemplateRouter from "./venueTemplate";

const organizationRouter = Router();

organizationRouter.use("/venue-templates", venueTemplateRouter);

export default organizationRouter;

