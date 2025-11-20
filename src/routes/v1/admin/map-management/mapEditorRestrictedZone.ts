"use strict";

import { Router } from "express";
import {
  createRestrictedZone,
  deleteRestrictedZone,
  getRestrictedZoneById,
  getRestrictedZonesByFloorPlan,
  updateRestrictedZone,
} from "../../../../controllers/admin/map-management/mapEditorRestrictedZone";

const router = Router();

router.get("/", getRestrictedZonesByFloorPlan);

router.get("/:id", getRestrictedZoneById);

router.post("/", createRestrictedZone);

router.put("/:id", updateRestrictedZone);

router.delete("/:id", deleteRestrictedZone);

export default router;

