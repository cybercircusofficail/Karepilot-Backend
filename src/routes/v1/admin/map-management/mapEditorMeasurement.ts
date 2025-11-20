"use strict";

import { Router } from "express";
import {
  createMeasurement,
  deleteMeasurement,
  getMeasurementById,
  getMeasurementsByFloorPlan,
  updateMeasurement,
} from "../../../../controllers/admin/map-management/mapEditorMeasurement";

const router = Router();

router.get("/", getMeasurementsByFloorPlan);

router.get("/:id", getMeasurementById);

router.post("/", createMeasurement);

router.put("/:id", updateMeasurement);

router.delete("/:id", deleteMeasurement);

export default router;

