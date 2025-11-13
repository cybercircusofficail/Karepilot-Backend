import { Router } from "express";
import buildingsRouter from "./buildings";
import floorsRouter from "./floors";
import settingsRouter from "./settings";
import floorPlansRouter from "./floor-plans";

const router = Router();

router.use("/buildings", buildingsRouter);
router.use("/floors", floorsRouter);
router.use("/settings", settingsRouter);
router.use("/floor-plans", floorPlansRouter);

export default router;


