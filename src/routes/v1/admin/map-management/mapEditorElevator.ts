"use strict";

import { Router } from "express";
import {
  createElevator,
  deleteElevator,
  getElevatorById,
  getElevatorsByFloorPlan,
  updateElevator,
} from "../../../../controllers/admin/map-management/mapEditorElevator";

const router = Router();

router.get("/", getElevatorsByFloorPlan);

router.get("/:id", getElevatorById);

router.post("/", createElevator);

router.put("/:id", updateElevator);

router.delete("/:id", deleteElevator);

export default router;
