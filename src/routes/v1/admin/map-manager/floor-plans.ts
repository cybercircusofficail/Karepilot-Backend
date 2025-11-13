import { Router } from "express";
import {
  createFloorPlan,
  deleteFloorPlan,
  getFloorPlanById,
  getFloorPlans,
  getFloorPlanStats,
  updateFloorPlan,
} from "../../../../controllers/admin/map-manager";
import { validate } from "../../../../utils";
import {
  createFloorPlanSchema,
  floorPlanIdParamSchema,
  floorPlanQuerySchema,
  updateFloorPlanSchema,
} from "../../../../validations/admin/map-manager";

const router = Router();

router
  .route("/")
  .get(validate(floorPlanQuerySchema, "query"), getFloorPlans)
  .post(validate(createFloorPlanSchema), createFloorPlan);

router.get(
  "/stats",
  validate(floorPlanQuerySchema, "query"),
  getFloorPlanStats,
);

router
  .route("/:id")
  .get(validate(floorPlanIdParamSchema, "params"), getFloorPlanById)
  .put(
    validate(floorPlanIdParamSchema, "params"),
    validate(updateFloorPlanSchema),
    updateFloorPlan,
  )
  .delete(validate(floorPlanIdParamSchema, "params"), deleteFloorPlan);

export default router;


